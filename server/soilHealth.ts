// Area-level soil-test results from the Soil Health Card (SHC) portal, Dept. of Agriculture &
// Farmers Welfare, Govt. of India (https://soilhealth.dac.gov.in).
//
// The portal's public dashboard is backed by a GraphQL service at soilhealth4.dac.gov.in. It is
// not a documented/supported public API, so it may change without notice; every failure here
// degrades to "unavailable" and the farmer enters values manually.
//
// What the service actually provides (verified): for each village/block/district and soil-testing
// cycle, the NUMBER OF SOIL SAMPLES rated Low/Medium/High for available N, P, K and
// Acidic/Neutral/Alkaline for pH. It does not provide mean numeric values, and the rating
// thresholds differ between state labs, so we never convert these categories into numbers.
//
// SHC location records carry LGD codes (state, district, block, village), which is how we map
// the LGD-based location picker onto SHC records.
import { cached, fetchWithTimeout, UpstreamError } from "./cache";

const SHC_GRAPHQL = "https://soilhealth4.dac.gov.in/";
const SERVICE = "Soil Health Card portal";
const MASTER_TTL = 24 * 60 * 60 * 1000;
const RESULTS_TTL = 6 * 60 * 60 * 1000;
// Fewer samples than this at a level is too thin to describe the area; use the next level up.
export const MIN_SAMPLES = 10;

export const SHC_SOURCE = {
  name: "Soil Health Card portal, Dept. of Agriculture & Farmers Welfare, Govt. of India",
  url: "https://soilhealth.dac.gov.in",
};

type Level = "village" | "block" | "district";
type Counts = Record<string, number>;

export type NutrientSummary = {
  counts: Counts;
  total: number;
  dominant: string;
  dominantShare: number; // 0-100
};

export type SoilLookupResult =
  | {
      status: "available";
      source: typeof SHC_SOURCE;
      dataType: "measured_area_aggregate";
      level: Level;
      requestedLevel: "village" | "district";
      fallbackReason?: "village_not_found" | "village_insufficient_samples" | "block_insufficient_samples";
      area: { name: string; code: string };
      cycle: string;
      sampleCount: number;
      lastUpdated: string | null;
      cyclesAvailable: { cycle: string; samples: number }[];
      nutrients: { n: NutrientSummary | null; p: NutrientSummary | null; k: NutrientSummary | null; ph: NutrientSummary | null };
    }
  | {
      status: "unavailable";
      source: typeof SHC_SOURCE;
      reason: "state_not_covered" | "district_not_covered" | "no_samples";
    };

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetchWithTimeout(
    SHC_GRAPHQL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "FarmWiseAI/1.0 (academic project)" },
      body: JSON.stringify({ query, variables }),
    },
    SERVICE,
    20000,
  );
  let body: any;
  try {
    body = await res.json();
  } catch {
    throw new UpstreamError(SERVICE, `${SERVICE} returned an unexpected response`);
  }
  if (!res.ok || body?.errors?.length || !body?.data) {
    throw new UpstreamError(SERVICE, `${SERVICE} is temporarily unavailable`);
  }
  return body.data as T;
}

const shcStates = () =>
  cached("shc:states", MASTER_TTL, async () => {
    const d = await gql<{ getState: any[] }>(`query Q { getState }`, {});
    return d.getState ?? [];
  });

const shcDistricts = (stateId: string) =>
  cached(`shc:districts:${stateId}`, MASTER_TTL, async () => {
    const d = await gql<{ getdistrictAndSubdistrictBystate: any[] }>(
      `query Q($state: ID, $subdistrict: Boolean) { getdistrictAndSubdistrictBystate(state: $state, subdistrict: $subdistrict) }`,
      { state: stateId, subdistrict: false },
    );
    return d.getdistrictAndSubdistrictBystate ?? [];
  });

// Village codes are stable LGD codes, while districts get split/renamed; looking a village up by
// its code alone also works when LGD has a new district code that SHC has not adopted yet.
const shcVillageByCode = (villageCode: number) =>
  cached(`shc:village:${villageCode}`, MASTER_TTL, async () => {
    const d = await gql<{ getVillageBydistrict: any[] }>(
      `query Q($code: String) { getVillageBydistrict(code: $code) }`,
      { code: String(villageCode) },
    );
    return (d.getVillageBydistrict ?? []).find((v) => String(v?.code) === String(villageCode)) ?? null;
  });

// Returns one row per child unit (blocks when filtered by district, villages when filtered by
// block) per cycle and scheme. Note: the service ignores the `village` argument, so village
// rows are filtered by us.
const shcResults = (vars: { state: string; district: string; block?: string }) =>
  cached(`shc:results:${vars.state}:${vars.district}:${vars.block ?? "-"}`, RESULTS_TTL, async () => {
    const d = await gql<{ getNutrientDashboardForPortal: any[] }>(
      `query Q($state: ID, $district: ID, $block: ID) { getNutrientDashboardForPortal(state: $state, district: $district, block: $block) }`,
      vars,
    );
    return d.getNutrientDashboardForPortal ?? [];
  });

const NUTRIENT_KEYS = {
  n: { key: "n", classes: ["Low", "Medium", "High"] },
  p: { key: "p", classes: ["Low", "Medium", "High"] },
  k: { key: "k", classes: ["Low", "Medium", "High"] },
  ph: { key: "pH", classes: ["Acidic", "Neutral", "Alkaline"] },
} as const;

function summarise(rows: any[], key: string, classes: readonly string[]): NutrientSummary | null {
  const counts: Counts = Object.fromEntries(classes.map((c) => [c, 0]));
  for (const r of rows) {
    const res = r?.results?.[key];
    if (!res) continue;
    for (const c of classes) {
      const v = Number(res[c]);
      if (Number.isFinite(v) && v > 0) counts[c] += v;
    }
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  const dominant = classes.reduce((best, c) => (counts[c] > counts[best] ? c : best), classes[0]);
  return { counts, total, dominant, dominantShare: Math.round((counts[dominant] / total) * 100) };
}

// Samples per cycle, measured as the number of N tests (every SHC sample is tested for N).
function samplesByCycle(rows: any[]) {
  const map = new Map<string, number>();
  for (const r of rows) {
    if (!r?.cycle) continue;
    const n = r.results?.n ?? {};
    const s = ["Low", "Medium", "High"].reduce((a, c) => a + (Number(n[c]) || 0), 0);
    map.set(r.cycle, (map.get(r.cycle) ?? 0) + s);
  }
  return [...map.entries()]
    .map(([cycle, samples]) => ({ cycle, samples }))
    .sort((a, b) => b.cycle.localeCompare(a.cycle));
}

// Latest cycle with enough samples at this level, summed across schemes (as the portal does).
function buildLevel(rows: any[]) {
  const cycles = samplesByCycle(rows);
  const chosen = cycles.find((c) => c.samples >= MIN_SAMPLES);
  if (!chosen) return null;
  const cycleRows = rows.filter((r) => r.cycle === chosen.cycle);
  const stamps = cycleRows
    .map((r) => r.lastProcessedAt ?? r.updatedAt)
    .filter((s): s is string => typeof s === "string")
    .sort();
  return {
    cycle: chosen.cycle,
    sampleCount: chosen.samples,
    lastUpdated: stamps.length ? stamps[stamps.length - 1] : null,
    cyclesAvailable: cycles,
    nutrients: {
      n: summarise(cycleRows, NUTRIENT_KEYS.n.key, NUTRIENT_KEYS.n.classes),
      p: summarise(cycleRows, NUTRIENT_KEYS.p.key, NUTRIENT_KEYS.p.classes),
      k: summarise(cycleRows, NUTRIENT_KEYS.k.key, NUTRIENT_KEYS.k.classes),
      ph: summarise(cycleRows, NUTRIENT_KEYS.ph.key, NUTRIENT_KEYS.ph.classes),
    },
  };
}

const cleanName = (s: unknown) => String(s ?? "").replace(/\s*-\s*\d+$/, "").trim();

export async function lookupSoil(params: {
  stateCode: number;
  districtCode: number;
  villageCode?: number;
}): Promise<SoilLookupResult> {
  const base = { source: SHC_SOURCE };

  const state = (await shcStates()).find((s) => String(s.code) === String(params.stateCode));
  if (!state) return { ...base, status: "unavailable", reason: "state_not_covered" };

  let district = (await shcDistricts(state._id)).find((d) => String(d.code) === String(params.districtCode));

  const requestedLevel = params.villageCode ? "village" : "district";
  let fallbackReason: Extract<SoilLookupResult, { status: "available" }>["fallbackReason"];

  if (params.villageCode) {
    const found = await shcVillageByCode(params.villageCode);
    const village = found && found.state?._id === state._id ? found : null;
    // Use the district SHC files this village under (may differ from LGD's newest district).
    if (village?.district?._id) district = { ...village.district, _id: village.district._id };
    if (!district) return { ...base, status: "unavailable", reason: "district_not_covered" };
    if (!village?.block?._id) {
      fallbackReason = "village_not_found";
    } else {
      const blockRows = await shcResults({ state: state._id, district: district._id, block: village.block._id });
      const villageLevel = buildLevel(blockRows.filter((r) => r.village?._id === village._id));
      if (villageLevel) {
        return {
          ...base,
          status: "available",
          dataType: "measured_area_aggregate",
          level: "village",
          requestedLevel,
          area: { name: cleanName(village.name), code: String(village.code) },
          ...villageLevel,
        };
      }
      const blockLevel = buildLevel(blockRows);
      if (blockLevel) {
        return {
          ...base,
          status: "available",
          dataType: "measured_area_aggregate",
          level: "block",
          requestedLevel,
          fallbackReason: "village_insufficient_samples",
          area: { name: cleanName(village.block.name), code: String(village.block.code) },
          ...blockLevel,
        };
      }
      fallbackReason = "block_insufficient_samples";
    }
  }

  if (!district) return { ...base, status: "unavailable", reason: "district_not_covered" };
  const districtLevel = buildLevel(await shcResults({ state: state._id, district: district._id }));
  if (!districtLevel) return { ...base, status: "unavailable", reason: "no_samples" };
  return {
    ...base,
    status: "available",
    dataType: "measured_area_aggregate",
    level: "district",
    requestedLevel,
    ...(fallbackReason ? { fallbackReason } : {}),
    area: { name: cleanName(district.name), code: String(district.code) },
    ...districtLevel,
  };
}
