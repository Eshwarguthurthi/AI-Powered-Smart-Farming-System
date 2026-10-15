// Keyless, all-India mandi prices from an open daily archive of AGMARKNET records:
// https://github.com/herrrickshaw/agri-commodity-tracker (data/mandi_prices_snapshot.csv).
// The archive's collector pulls the official data.gov.in AGMARKNET resource and commits the rows
// to GitHub, so it can be read without any API key. It is NOT an official service and can lag
// behind the government feed: the UI always shows how old the latest prices are.
//
// The 50+ MB CSV is downloaded only when the repository's file changes, then pre-processed into
// small per-state files in data/market/ (latest trading day + per-commodity daily averages).
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import zlib from "node:zlib";

const REPO = "herrrickshaw/agri-commodity-tracker";
const FILE = "data/mandi_prices_snapshot.csv";
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/main/${FILE}`;
const COMMITS_URL = `https://api.github.com/repos/${REPO}/commits?path=${encodeURIComponent(FILE)}&per_page=1`;
export const SNAPSHOT_SOURCE = {
  name: "Open daily archive of AGMARKNET mandi prices (GitHub: herrrickshaw/agri-commodity-tracker)",
  url: `https://github.com/${REPO}`,
  official: false,
};

const DIR = path.resolve(process.cwd(), "data", "market");
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;
const HISTORY_DAYS = 60;

export type SnapshotRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
};
type HistoryRow = [date: string, avgModal: number, avgMin: number, avgMax: number, reports: number];
export type SnapshotState = { state: string; latestDate: string; records: SnapshotRecord[]; history: Record<string, HistoryRow[]> };
type Meta = { sha: string; committedAt: string | null; builtAt: string; latestDate: string; states: Record<string, string> };

const slug = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const isoDate = (v: string) => {
  const m = v.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}/.test(v.trim()) ? v.trim().slice(0, 10) : "";
};
const clean = (v: string | undefined) => (v ?? "").replace(/\s+/g, " ").trim();

// Minimal RFC 4180 line parser (quoted fields may contain commas and doubled quotes).
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

const readMeta = (): Meta | null => {
  try {
    return JSON.parse(fs.readFileSync(path.join(DIR, "meta.json"), "utf-8"));
  } catch {
    return null;
  }
};

async function remoteVersion(): Promise<{ sha: string; committedAt: string | null }> {
  const res = await fetch(COMMITS_URL, { headers: { Accept: "application/vnd.github+json", "User-Agent": "FarmWiseAI" } });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const [c] = (await res.json()) as any[];
  if (!c?.sha) throw new Error("No commits found for the snapshot file");
  return { sha: c.sha, committedAt: c.commit?.committer?.date ?? null };
}

async function buildFrom(csvPath: string, version: { sha: string; committedAt: string | null }) {
  type Acc = { latest: string; records: SnapshotRecord[]; hist: Map<string, Map<string, [number, number, number, number]>> };
  const states = new Map<string, Acc>();
  const rl = readline.createInterface({ input: fs.createReadStream(csvPath, "utf-8"), crlfDelay: Infinity });
  let header: string[] | null = null;
  for await (const line of rl) {
    if (!line.trim()) continue;
    const f = parseCsvLine(line);
    if (!header) {
      header = f.map((h) => h.trim().toLowerCase());
      continue;
    }
    const get = (k: string) => f[header!.indexOf(k)];
    const rec: SnapshotRecord = {
      state: clean(get("state")),
      district: clean(get("district")),
      market: clean(get("market")),
      commodity: clean(get("commodity")),
      variety: clean(get("variety")),
      grade: clean(get("grade")),
      arrivalDate: isoDate(get("arrival_date") ?? ""),
      minPrice: Number(get("min_price")),
      maxPrice: Number(get("max_price")),
      modalPrice: Number(get("modal_price")),
    };
    if (!rec.state || !rec.market || !rec.commodity || !rec.arrivalDate) continue;
    if (!(rec.modalPrice > 0) || !(rec.minPrice >= 0) || !(rec.maxPrice >= rec.minPrice)) continue;

    let acc = states.get(rec.state);
    if (!acc) states.set(rec.state, (acc = { latest: "", records: [], hist: new Map() }));
    if (rec.arrivalDate > acc.latest) {
      acc.latest = rec.arrivalDate;
      acc.records = [];
    }
    if (rec.arrivalDate === acc.latest) acc.records.push(rec);
    let byDate = acc.hist.get(rec.commodity);
    if (!byDate) acc.hist.set(rec.commodity, (byDate = new Map()));
    const h = byDate.get(rec.arrivalDate) ?? [0, 0, 0, 0];
    h[0] += rec.modalPrice;
    h[1] += rec.minPrice;
    h[2] += rec.maxPrice;
    h[3] += 1;
    byDate.set(rec.arrivalDate, h);
  }

  fs.mkdirSync(DIR, { recursive: true });
  const index: Record<string, string> = {};
  let latestOverall = "";
  for (const [state, acc] of states) {
    const history: Record<string, HistoryRow[]> = {};
    for (const [commodity, byDate] of acc.hist) {
      history[commodity] = [...byDate.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-HISTORY_DAYS)
        .map(([d, [m, mi, ma, n]]) => [d, Math.round(m / n), Math.round(mi / n), Math.round(ma / n), n]);
    }
    const out: SnapshotState = { state, latestDate: acc.latest, records: acc.records, history };
    fs.writeFileSync(path.join(DIR, `${slug(state)}.json.gz`), zlib.gzipSync(JSON.stringify(out)));
    index[state] = acc.latest;
    if (acc.latest > latestOverall) latestOverall = acc.latest;
  }
  const meta: Meta = { sha: version.sha, committedAt: version.committedAt, builtAt: new Date().toISOString(), latestDate: latestOverall, states: index };
  fs.writeFileSync(path.join(DIR, "meta.json"), JSON.stringify(meta, null, 2));
  stateCache.clear();
  return meta;
}

let syncing: Promise<Meta | null> | null = null;
let lastCheck = 0;

/** Downloads and rebuilds the snapshot if GitHub has a newer version. Safe to call often. */
export function syncSnapshot(force = false): Promise<Meta | null> {
  if (syncing) return syncing;
  if (!force && Date.now() - lastCheck < CHECK_EVERY_MS && readMeta()) return Promise.resolve(readMeta());
  syncing = (async () => {
    lastCheck = Date.now();
    const current = readMeta();
    try {
      const version = await remoteVersion();
      if (current?.sha === version.sha && !force) return current;
      console.log(`[market] Downloading AGMARKNET archive ${version.sha.slice(0, 7)} (${version.committedAt ?? "unknown date"})…`);
      fs.mkdirSync(DIR, { recursive: true });
      const tmp = path.join(DIR, "snapshot.csv.tmp");
      const res = await fetch(RAW_URL, { headers: { "User-Agent": "FarmWiseAI" } });
      if (!res.ok || !res.body) throw new Error(`download failed (${res.status})`);
      await fs.promises.writeFile(tmp, Buffer.from(await res.arrayBuffer()));
      const meta = await buildFrom(tmp, version);
      fs.rmSync(tmp, { force: true });
      console.log(`[market] Archive ready: ${Object.keys(meta.states).length} states, latest prices ${meta.latestDate}`);
      return meta;
    } catch (e: any) {
      console.warn(`[market] Archive update failed (${e.message}); ${current ? "using the existing copy" : "no copy available yet"}`);
      return current;
    } finally {
      syncing = null;
    }
  })();
  return syncing;
}

const stateCache = new Map<string, SnapshotState>();

export function snapshotStates(): Record<string, string> {
  return readMeta()?.states ?? {};
}

export function snapshotInfo() {
  const m = readMeta();
  return m ? { committedAt: m.committedAt, builtAt: m.builtAt, latestDate: m.latestDate } : null;
}

/** Per-state latest-day records and history, or null if the archive has no rows for it. */
export function loadSnapshotState(datasetStateName: string): SnapshotState | null {
  if (stateCache.has(datasetStateName)) return stateCache.get(datasetStateName)!;
  const file = path.join(DIR, `${slug(datasetStateName)}.json.gz`);
  if (!fs.existsSync(file)) return null;
  const data: SnapshotState = JSON.parse(zlib.gunzipSync(fs.readFileSync(file)).toString("utf-8"));
  stateCache.set(datasetStateName, data);
  return data;
}

export const isSnapshotSyncing = () => syncing !== null;
