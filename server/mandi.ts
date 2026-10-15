// Daily wholesale (mandi) prices from AGMARKNET (Ministry of Agriculture & Farmers Welfare).
//
// Two providers, tried in this order:
//  1. Official: data.gov.in resource "Current Daily Price of Various Commodities from Various
//     Markets (Mandi)". Needs a free personal key in env DATA_GOV_IN_API_KEY. All states.
//  2. Keyless fallback: the community "Mandi Price API" (https://mandi-api.vercel.app), which
//     re-publishes the same data.gov.in records daily. Not an official service; covers only the
//     states it lists (5 at the time of writing) and adds a daily price-history endpoint.
// Agmarknet's own API (api.agmarknet.gov.in) now requires a captcha, so it is not used.
//
// Prices are Rs./quintal as reported by each market. Nothing is estimated: rows with missing or
// inconsistent prices are dropped, and if no provider has data the API says so.
import { cached, fetchWithTimeout, UpstreamError } from "./cache";
import { loadSnapshotState, SNAPSHOT_SOURCE, snapshotInfo, snapshotStates } from "./marketSnapshot";

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const OGD_API = `https://api.data.gov.in/resource/${RESOURCE_ID}`;
const OGD_SERVICE = "data.gov.in (AGMARKNET)";
const COMMUNITY_API = "https://mandi-api.onrender.com/v1";
const COMMUNITY_SERVICE = "Mandi Price API (community mirror)";
const TTL = 30 * 60 * 1000; // sources refresh daily
const OGD_PAGE = 1000;
const OGD_MAX_PAGES = 5;
const COMMUNITY_PAGE = 200; // the mirror caps responses at 200 rows
const COMMUNITY_MAX_PAGES = 10; // up to 2,000 reports for the latest day
const COMMUNITY_PARALLEL = 3;
// The mirror allows 100 requests / 15 min per IP and syncs once a day, so cache its data longer.
const COMMUNITY_TTL = 3 * 60 * 60 * 1000;

export type MandiProvider = "data_gov_in" | "community_mirror" | "github_archive";

export const SOURCES: Record<MandiProvider, { name: string; url: string; official: boolean }> = {
  data_gov_in: {
    name: "AGMARKNET daily mandi prices, Open Government Data Platform India (data.gov.in)",
    url: "https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi",
    official: true,
  },
  community_mirror: {
    name: "Mandi Price API (community mirror of data.gov.in AGMARKNET records)",
    url: "https://mandi-api.vercel.app",
    official: false,
  },
  github_archive: SNAPSHOT_SOURCE,
};

// Spellings used by data.gov.in where they differ from LGD / the app.
const STATE_ALIASES: Record<string, string[]> = {
  Kerala: ["Keralam"],
  Chhattisgarh: ["Chattisgarh"],
  Delhi: ["NCT of Delhi"],
  Odisha: ["Orissa"],
  Puducherry: ["Pondicherry"],
  "Andaman and Nicobar Islands": ["Andaman and Nicobar"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman and Diu"],
};

export type MandiRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string; // ISO yyyy-mm-dd
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
};

export type CommoditySummary = {
  commodity: string;
  markets: number;
  medianModal: number;
  minPrice: number;
  maxPrice: number;
  latestDate: string;
};

type Source = (typeof SOURCES)[MandiProvider];

export type MandiResponse =
  | {
      status: "ok";
      provider: MandiProvider;
      source: Source;
      unit: "Rs./quintal";
      state: string;
      fetchedAt: string;
      syncedAt: string | null; // when the provider last pulled from the government feed, if known
      latestArrivalDate: string;
      records: MandiRecord[];
      commodities: CommoditySummary[];
      districts: string[];
      truncated: boolean;
      fallbackReason?: "no_key" | "key_rate_limited" | "key_rejected";
    }
  | { status: "no_data"; provider: MandiProvider; source: Source; state: string; fetchedAt: string };

export type PriceHistoryPoint = { date: string; avgModal: number; avgMin: number; avgMax: number; reports: number };

// The key printed in data.gov.in's documentation is shared by everyone and permanently
// rate-limited; treat it as "no key" instead of wasting a request on it.
const PUBLIC_SAMPLE_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

/** A provider refused because of its rate limit; retryAfterSec is when to try again. */
export class MandiRateLimitError extends UpstreamError {
  constructor(service: string, public retryAfterSec: number) {
    super(service, `${service} is rate-limiting requests`, 503);
  }
}

/** No provider can serve this state (no working key, and the keyless mirror doesn't cover it). */
export class MandiConfigError extends Error {
  constructor(message: string, public keylessStates: string[] = [], public reason: "no_key" | "key_rate_limited" | "key_rejected" = "no_key") {
    super(message);
  }
}

const num = (v: unknown) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : NaN;
};
// dd/mm/yyyy (data.gov.in) or ISO -> yyyy-mm-dd
const isoDate = (v: unknown) => {
  const s = String(v ?? "").trim();
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : "";
};
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};
const clean = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();

function normalise(r: any): MandiRecord | null {
  const rec = {
    state: clean(r.state),
    district: clean(r.district),
    market: clean(r.market),
    commodity: clean(r.commodity),
    variety: clean(r.variety),
    grade: clean(r.grade),
    arrivalDate: isoDate(r.arrival_date),
    minPrice: num(r.min_price),
    maxPrice: num(r.max_price),
    modalPrice: num(r.modal_price),
  };
  // Skip incomplete rows rather than show zeros as prices.
  if (!rec.market || !rec.commodity || !rec.arrivalDate) return null;
  if (!(rec.modalPrice > 0) || !(rec.minPrice >= 0) || !(rec.maxPrice >= rec.minPrice)) return null;
  return rec;
}

function summarise(records: MandiRecord[]): CommoditySummary[] {
  const by = new Map<string, MandiRecord[]>();
  for (const r of records) by.set(r.commodity, [...(by.get(r.commodity) ?? []), r]);
  return [...by.entries()]
    .map(([commodity, rs]) => ({
      commodity,
      markets: new Set(rs.map((r) => r.market)).size,
      medianModal: Math.round(median(rs.map((r) => r.modalPrice))),
      minPrice: Math.min(...rs.map((r) => r.minPrice)),
      maxPrice: Math.max(...rs.map((r) => r.maxPrice)),
      latestDate: rs.map((r) => r.arrivalDate).sort().at(-1)!,
    }))
    .sort((a, b) => b.markets - a.markets || a.commodity.localeCompare(b.commodity));
}

function okResponse(
  provider: MandiProvider,
  state: string,
  records: MandiRecord[],
  extra: { syncedAt: string | null; truncated: boolean; fallbackReason?: "no_key" | "key_rate_limited" | "key_rejected" },
): MandiResponse {
  const fetchedAt = new Date().toISOString();
  if (!records.length) return { status: "no_data", provider, source: SOURCES[provider], state, fetchedAt };
  return {
    status: "ok",
    provider,
    source: SOURCES[provider],
    unit: "Rs./quintal",
    state,
    fetchedAt,
    latestArrivalDate: records.map((r) => r.arrivalDate).sort().at(-1)!,
    records,
    commodities: summarise(records),
    districts: [...new Set(records.map((r) => r.district))].sort(),
    ...extra,
  };
}

// ---- Provider 1: data.gov.in (official) ---------------------------------------------------------

async function ogdPage(apiKey: string, stateName: string, offset: number) {
  const q = new URLSearchParams({ "api-key": apiKey, format: "json", limit: String(OGD_PAGE), offset: String(offset) });
  q.set("filters[state.keyword]", stateName);
  const res = await fetchWithTimeout(`${OGD_API}?${q}`, { headers: { Accept: "application/json" } }, OGD_SERVICE, 25000);
  const body: any = await res.json().catch(() => null);
  if (res.status === 401 || res.status === 403 || /invalid api key|key.*not.*valid/i.test(String(body?.error ?? body?.message ?? ""))) {
    throw new UpstreamError(OGD_SERVICE, "The data.gov.in API key was rejected", 502);
  }
  if (res.status === 429 || /rate limit/i.test(String(body?.error ?? ""))) {
    throw new UpstreamError(OGD_SERVICE, "data.gov.in is rate-limiting requests; try again shortly", 503);
  }
  if (!res.ok || !Array.isArray(body?.records)) {
    throw new UpstreamError(OGD_SERVICE, `${OGD_SERVICE} returned an unexpected response`, 502);
  }
  return { records: body.records as any[], total: Number(body.total) || 0 };
}

async function fromDataGovIn(apiKey: string, state: string): Promise<MandiResponse> {
  const raw: any[] = [];
  let truncated = false;
  for (const name of [state, ...aliasesOf(state)]) {
    let offset = 0;
    for (let page = 0; page < OGD_MAX_PAGES; page++) {
      const { records, total } = await ogdPage(apiKey, name, offset);
      raw.push(...records);
      offset += records.length;
      if (records.length < OGD_PAGE || offset >= total) break;
      if (page === OGD_MAX_PAGES - 1) truncated = true;
    }
    if (raw.length) break;
  }
  const records = raw.map(normalise).filter((r): r is MandiRecord => r !== null);
  return okResponse("data_gov_in", state, records, { syncedAt: null, truncated });
}

// ---- Provider 2: community mirror (keyless) -----------------------------------------------------

// The mirror allows 100 requests per 15 minutes per IP. After a 429, stop calling it until its
// Retry-After time so retries from the page don't keep the limit exhausted.
let communityBlockedUntil = 0;

async function communityGet(path: string): Promise<any> {
  const wait = Math.ceil((communityBlockedUntil - Date.now()) / 1000);
  if (wait > 0) throw new MandiRateLimitError(COMMUNITY_SERVICE, wait);
  // Hosted on a free tier: the first request after idle can take a while to wake up.
  const res = await fetchWithTimeout(`${COMMUNITY_API}${path}`, { headers: { Accept: "application/json" } }, COMMUNITY_SERVICE, 60000);
  const body: any = await res.json().catch(() => null);
  if (res.status === 429) {
    const retryAfter = Math.max(30, Number(res.headers.get("retry-after")) || 900);
    communityBlockedUntil = Date.now() + retryAfter * 1000;
    throw new MandiRateLimitError(COMMUNITY_SERVICE, retryAfter);
  }
  if (!res.ok || body?.success !== true) {
    throw new UpstreamError(COMMUNITY_SERVICE, `${COMMUNITY_SERVICE} is unavailable`, 502);
  }
  return body;
}

export const keylessStates = () =>
  cached("mandi:community:states", 24 * 60 * 60 * 1000, async () => {
    const body = await communityGet("/states");
    return (Array.isArray(body.data) ? body.data : []).map((s: unknown) => clean(s)).filter(Boolean) as string[];
  });

const sameState = (a: string, b: string) => a.toLowerCase().replace(/&/g, "and").trim() === b.toLowerCase().replace(/&/g, "and").trim();

async function fromCommunity(state: string, fallbackReason?: "no_key" | "key_rate_limited" | "key_rejected"): Promise<MandiResponse> {
  const supported = await keylessStates();
  const name = supported.find((s) => sameState(s, state));
  if (!name) {
    throw new MandiConfigError(`Keyless mandi prices do not cover ${state}`, supported, fallbackReason ?? "no_key");
  }
  // First page (no date) returns the latest trading day; then page through that date only.
  // Row order is not stable between calls, so de-duplicate by id.
  const first = await communityGet(`/prices?${new URLSearchParams({ state: name, limit: String(COMMUNITY_PAGE), offset: "0" })}`);
  const firstRows: any[] = Array.isArray(first.data) ? first.data : [];
  const syncedAt: string | null = first.meta?.latest_fetched_at ?? null;
  const latest = firstRows.map((r) => isoDate(r.arrival_date)).filter(Boolean).sort().at(-1);
  const byId = new Map<number, any>(firstRows.map((r) => [Number(r.id), r]));
  let truncated = false;
  if (latest && firstRows.length === COMMUNITY_PAGE) {
    let page = 1;
    let done = false;
    while (!done && page < COMMUNITY_MAX_PAGES) {
      const batch = Array.from({ length: Math.min(COMMUNITY_PARALLEL, COMMUNITY_MAX_PAGES - page) }, (_, i) => page + i);
      const results = await Promise.all(
        batch.map((p) =>
          communityGet(`/prices?${new URLSearchParams({ state: name, date: latest, limit: String(COMMUNITY_PAGE), offset: String(p * COMMUNITY_PAGE) })}`),
        ),
      );
      const before = byId.size;
      for (const body of results) {
        const rows: any[] = Array.isArray(body.data) ? body.data : [];
        for (const r of rows) byId.set(Number(r.id), r);
        if (rows.length < COMMUNITY_PAGE) done = true;
      }
      // The mirror's row order isn't stable, so pages overlap; stop once a batch adds nothing new.
      if (byId.size === before) done = true;
      page += batch.length;
    }
    truncated = !done;
  }
  const records = [...byId.values()]
    .map(normalise)
    .filter((r): r is MandiRecord => r !== null && r.arrivalDate === latest);
  return okResponse("community_mirror", state, records, { syncedAt, truncated, fallbackReason });
}

// ---- Public API ---------------------------------------------------------------------------------

const fromCommunityCached = (state: string, reason?: "no_key" | "key_rate_limited" | "key_rejected") =>
  cached(`mandi:community:${state}:${reason ?? ""}`, COMMUNITY_TTL, () => fromCommunity(state, reason));

// ---- Provider 3: open GitHub archive (keyless, all reporting states, may lag) -------------------

// Alias lookup ignores case/"&" so LGD spellings ("Andaman And Nicobar Islands") match too.
const aliasesOf = (state: string) => Object.entries(STATE_ALIASES).find(([k]) => sameState(k, state))?.[1] ?? [];

function archiveStateName(state: string): string | null {
  const names = Object.keys(snapshotStates());
  for (const candidate of [state, ...aliasesOf(state)]) {
    const hit = names.find((n) => sameState(n, candidate));
    if (hit) return hit;
  }
  return null;
}

function fromArchive(state: string, reason?: "no_key" | "key_rate_limited" | "key_rejected"): MandiResponse | null {
  const name = archiveStateName(state);
  const data = name ? loadSnapshotState(name) : null;
  if (!data) return null;
  const records = data.records.map((r) => normalise({ ...r, arrival_date: r.arrivalDate, min_price: r.minPrice, max_price: r.maxPrice, modal_price: r.modalPrice }))
    .filter((r): r is MandiRecord => r !== null);
  return okResponse("github_archive", state, records, { syncedAt: snapshotInfo()?.committedAt ?? null, truncated: false, fallbackReason: reason });
}

/** States that have free (keyless) prices from either source, in the app's spelling where possible. */
async function freeStates(): Promise<string[]> {
  const mirror = await keylessStates().catch(() => [] as string[]);
  const archive = Object.keys(snapshotStates()).map((n) => Object.entries(STATE_ALIASES).find(([, al]) => al.includes(n))?.[0] ?? n);
  return [...new Set([...mirror, ...archive])].sort();
}

async function keyless(state: string, reason: "no_key" | "key_rate_limited" | "key_rejected"): Promise<MandiResponse> {
  const mirrorCovers = (await keylessStates().catch(() => [] as string[])).some((s) => sameState(s, state));
  if (mirrorCovers) {
    try {
      return await fromCommunityCached(state, reason);
    } catch (e) {
      // Mirror busy or down: the archive is older but better than nothing; it says how old it is.
      const fallback = fromArchive(state, reason);
      if (fallback) {
        console.warn(`[mandi] ${(e as Error).message}; using the GitHub archive for ${state}`);
        return fallback;
      }
      throw e;
    }
  }
  const archived = fromArchive(state, reason);
  if (archived) return archived;
  throw new MandiConfigError(`No free mandi price source covers ${state}`, await freeStates(), reason);
}

// ---- Public API ---------------------------------------------------------------------------------

export function getMandiPrices(state: string): Promise<MandiResponse> {
  return cached(`mandi:${state}`, TTL, async () => {
    const configured = process.env.DATA_GOV_IN_API_KEY?.trim().replace(/^"|"$/g, "");
    const apiKey = configured && configured !== PUBLIC_SAMPLE_KEY ? configured : "";
    if (!apiKey) return keyless(state, "no_key");
    try {
      return await fromDataGovIn(apiKey, state);
    } catch (e) {
      if (e instanceof UpstreamError && /rate-limiting|rejected/.test(e.message)) {
        const reason = /rejected/.test(e.message) ? "key_rejected" : "key_rate_limited";
        console.warn(`[mandi] ${e.message}; using keyless sources for ${state}`);
        return keyless(state, reason);
      }
      throw e;
    }
  });
}

/** Daily state-wide averages for one commodity (keyless mirror only; data.gov.in has no history). */
export function getPriceHistory(state: string, commodity: string, toDate?: string, provider?: string): Promise<PriceHistoryPoint[]> {
  if (provider === "github_archive") {
    const name = archiveStateName(state);
    const rows = (name && loadSnapshotState(name)?.history[commodity]) || [];
    return Promise.resolve(rows.map(([date, avgModal, avgMin, avgMax, reports]) => ({ date, avgModal, avgMin, avgMax, reports })));
  }
  return cached(`mandi:history:${state}:${commodity}:${toDate ?? ""}`, COMMUNITY_TTL, async () => {
    const supported = await keylessStates();
    const name = supported.find((s) => sameState(s, state));
    if (!name) return [];
    // Without from/to the mirror returns its OLDEST days, so always ask for the recent window.
    const to = toDate && /^\d{4}-\d{2}-\d{2}$/.test(toDate) ? toDate : new Date().toISOString().slice(0, 10);
    // The mirror returns at most ~26 points counted from `from`, so keep the window to 30 days.
    const from = new Date(new Date(to + "T00:00:00Z").getTime() - 30 * 86400000).toISOString().slice(0, 10);
    const body = await communityGet(`/prices/history?${new URLSearchParams({ state: name, commodity, from, to })}`);
    return (Array.isArray(body.data) ? body.data : [])
      .map((p: any) => ({
        date: isoDate(p.arrival_date),
        avgModal: Math.round(num(p.avg_modal_price)),
        avgMin: Math.round(num(p.avg_min_price)),
        avgMax: Math.round(num(p.avg_max_price)),
        reports: Number(p.data_points) || 0,
      }))
      .filter((p: PriceHistoryPoint) => p.date && p.avgModal > 0)
      .sort((a: PriceHistoryPoint, b: PriceHistoryPoint) => a.date.localeCompare(b.date));
  });
}
