// Location hierarchy from the Local Government Directory (LGD), Ministry of Panchayati Raj.
//
// Served from a complete local snapshot in data/lgd/ (built by `npm run lgd:sync`, see
// scripts/sync-lgd.ts), so the dropdowns do not depend on LGD being reachable at request time.
// If a snapshot file is missing, we fall back to LGD's public web service
// (https://lgdirectory.gov.in/webservices/lgdws/<list>, POST, form-encoded).
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { cached, fetchWithTimeout, UpstreamError } from "./cache";

const DATA_DIR = path.resolve(process.cwd(), "data", "lgd");
const LGD_BASE = "https://lgdirectory.gov.in/webservices/lgdws";
const SERVICE = "Local Government Directory (LGD)";
const LIVE_TTL = 24 * 60 * 60 * 1000;

export type Place = { code: number; name: string; nameLocal?: string };

// ---- Local snapshot ---------------------------------------------------------------------------

const readJson = <T>(file: string): T | null => {
  const full = path.join(DATA_DIR, file);
  return fs.existsSync(full) ? (JSON.parse(fs.readFileSync(full, "utf-8")) as T) : null;
};

let snapshot:
  | {
      meta: any;
      states: Place[];
      districts: Record<string, Place[]>;
      subdistricts: Record<string, Place[]>;
      stateOfSubdistrict: Map<number, number>;
    }
  | null
  | undefined;

function loadSnapshot() {
  if (snapshot !== undefined) return snapshot;
  const states = readJson<Place[]>("states.json");
  const districts = readJson<Record<string, Place[]>>("districts.json");
  const subdistricts = readJson<Record<string, Place[]>>("subdistricts.json");
  if (!states || !districts || !subdistricts) {
    console.warn(`[LGD] No snapshot in ${DATA_DIR}; using the live LGD web service. Run \`npm run lgd:sync\`.`);
    return (snapshot = null);
  }
  const stateOfSubdistrict = new Map<number, number>();
  for (const [stateCode, dList] of Object.entries(districts)) {
    for (const d of dList) for (const sd of subdistricts[d.code] ?? []) stateOfSubdistrict.set(sd.code, Number(stateCode));
  }
  const meta = readJson<any>("meta.json");
  console.log(`[LGD] Loaded snapshot from ${meta?.fetchedAt ?? "unknown date"}: ${JSON.stringify(meta?.counts ?? {})}`);
  return (snapshot = { meta, states, districts, subdistricts, stateOfSubdistrict });
}

const villageFiles = new Map<number, Record<string, (string | number)[][]>>();
function villagesForState(stateCode: number) {
  if (!villageFiles.has(stateCode)) {
    const file = path.join(DATA_DIR, "villages", `${stateCode}.json.gz`);
    if (!fs.existsSync(file)) return null;
    villageFiles.set(stateCode, JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString("utf-8")));
  }
  return villageFiles.get(stateCode)!;
}

export function getSnapshotInfo() {
  const s = loadSnapshot();
  return s ? { source: s.meta?.source, sourceUrl: s.meta?.sourceUrl, fetchedAt: s.meta?.fetchedAt, counts: s.meta?.counts } : null;
}

// ---- Live fallback ----------------------------------------------------------------------------

async function lgdPost(list: string, params: Record<string, string>): Promise<any[]> {
  const res = await fetchWithTimeout(
    `${LGD_BASE}/${list}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      // LGD's firewall rejects a POST with no body, so always send one (possibly empty).
      body: new URLSearchParams(params).toString(),
    },
    SERVICE,
  );
  const text = await res.text();
  if (/does not exist in LGD/i.test(text)) return [];
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) return data;
  } catch {
    // fall through
  }
  throw new UpstreamError(SERVICE, `${SERVICE} returned an unexpected response`);
}

function toPlaces(rows: any[], codeKey: string, nameKey: string, localKey: string): Place[] {
  return rows
    .filter((r) => r && Number.isFinite(Number(r[codeKey])) && typeof r[nameKey] === "string")
    .map((r) => {
      const name = String(r[nameKey]).replace(/\s+/g, " ").trim();
      const local = typeof r[localKey] === "string" ? r[localKey].replace(/\s+/g, " ").trim() : "";
      return {
        code: Number(r[codeKey]),
        name,
        ...(local && local.toLowerCase() !== name.toLowerCase() ? { nameLocal: local } : {}),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a.code - b.code);
}

// ---- Public API -------------------------------------------------------------------------------

export async function getStates(): Promise<Place[]> {
  const s = loadSnapshot();
  if (s) return s.states;
  return cached("lgd:states", LIVE_TTL, async () =>
    toPlaces(await lgdPost("stateList", {}), "stateCode", "stateNameEnglish", "stateNameLocal"),
  );
}

export async function getDistricts(stateCode: number): Promise<Place[]> {
  const s = loadSnapshot();
  if (s?.districts[stateCode]) return s.districts[stateCode];
  return cached(`lgd:districts:${stateCode}`, LIVE_TTL, async () =>
    toPlaces(await lgdPost("districtList", { stateCode: String(stateCode) }), "districtCode", "districtNameEnglish", "districtNameLocal"),
  );
}

export async function getSubdistricts(districtCode: number): Promise<Place[]> {
  const s = loadSnapshot();
  if (s?.subdistricts[districtCode]) return s.subdistricts[districtCode];
  return cached(`lgd:subdistricts:${districtCode}`, LIVE_TTL, async () =>
    toPlaces(
      await lgdPost("subdistrictList", { districtCode: String(districtCode) }),
      "subdistrictCode",
      "subdistrictNameEnglish",
      "subdistrictNameLocal",
    ),
  );
}

export async function getVillages(subdistrictCode: number): Promise<Place[]> {
  const s = loadSnapshot();
  const stateCode = s?.stateOfSubdistrict.get(subdistrictCode);
  const rows = stateCode !== undefined ? villagesForState(stateCode)?.[subdistrictCode] : undefined;
  if (rows) {
    return rows.map(([code, name, nameLocal]) => ({
      code: Number(code),
      name: String(name),
      ...(nameLocal ? { nameLocal: String(nameLocal) } : {}),
    }));
  }
  return cached(`lgd:villages:${subdistrictCode}`, LIVE_TTL, async () =>
    toPlaces(
      await lgdPost("villageList", { subDistrictCode: String(subdistrictCode) }),
      "villageCode",
      "villageNameEnglish",
      "villageNameLocal",
    ),
  );
}
