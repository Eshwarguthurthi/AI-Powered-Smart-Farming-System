// Builds a complete local snapshot of India's location hierarchy from the Local Government
// Directory (LGD), Ministry of Panchayati Raj: https://lgdirectory.gov.in
//
//   npm run lgd:sync            # full refresh (all states; ~7,000 sub-districts, takes a while)
//   npm run lgd:sync -- 28 36   # refresh only the given LGD state codes
//
// Output (read by server/locations.ts):
//   data/lgd/meta.json                      fetch time + counts
//   data/lgd/states.json                    [{ code, name, nameLocal? }]
//   data/lgd/districts.json                 { [stateCode]: Place[] }
//   data/lgd/subdistricts.json              { [districtCode]: Place[] }
//   data/lgd/villages/<stateCode>.json.gz   { [subdistrictCode]: [code, name, nameLocal?][] }
//
// Uses LGD's public web service (POST, form-encoded). LGD allows roughly 100 requests per minute
// per client (measured: HTTP 429 after 100 rapid requests, cleared after ~45-60 s), so requests
// are spaced globally and a 429 pauses the whole crawl. A full run takes ~1.5 hours; an
// interrupted run resumes, skipping states already saved (pass --force to refetch them).
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const BASE = "https://lgdirectory.gov.in/webservices/lgdws";
const OUT = path.resolve(process.cwd(), "data", "lgd");
const CONCURRENCY = 2;
const MIN_GAP_MS = 700; // ≈85 requests/minute, under LGD's limit

type Place = { code: number; name: string; nameLocal?: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let nextSlot = 0;
let pausedUntil = 0;
async function throttle() {
  for (;;) {
    const now = Date.now();
    const at = Math.max(nextSlot, pausedUntil);
    if (at <= now) {
      nextSlot = now + MIN_GAP_MS;
      return;
    }
    await sleep(at - now);
  }
}

async function lgd(list: string, params: Record<string, string>): Promise<any[]> {
  for (let attempt = 1; ; attempt++) {
    await throttle();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      const res = await fetch(`${BASE}/${list}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: new URLSearchParams(params).toString(),
        signal: controller.signal,
      });
      const text = await res.text();
      if (res.status === 429 || /"status"\s*:\s*429/.test(text)) {
        console.log("  LGD rate limit hit; pausing 65 s…");
        pausedUntil = Date.now() + 65000;
        attempt--; // rate limiting is not a failure of this request
        continue;
      }
      // An unknown/retired code is answered with plain text such as
      // "Entered SubDistrict Code 0 does not exist in LGD"; that is a real empty result.
      if (/does not exist in LGD/i.test(text)) return [];
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error(`unexpected response: ${text.slice(0, 80)}`);
      return data;
    } catch (e: any) {
      if (attempt >= 6) throw new Error(`${list} ${JSON.stringify(params)} failed: ${e.message}`);
      await sleep(2000 * 2 ** attempt);
    } finally {
      clearTimeout(timer);
    }
  }
}

function toPlaces(rows: any[], codeKey: string, nameKey: string, localKey: string): Place[] {
  const seen = new Set<number>();
  return rows
    .filter((r) => r && Number.isFinite(Number(r[codeKey])) && typeof r[nameKey] === "string" && r[nameKey].trim())
    .map((r) => {
      const name = String(r[nameKey]).replace(/\s+/g, " ").trim();
      const local = typeof r[localKey] === "string" ? r[localKey].replace(/\s+/g, " ").trim() : "";
      return {
        code: Number(r[codeKey]),
        name,
        ...(local && local.toLowerCase() !== name.toLowerCase() ? { nameLocal: local } : {}),
      };
    })
    .filter((p) => (seen.has(p.code) ? false : (seen.add(p.code), true)))
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a.code - b.code);
}

async function pool<T, R>(items: T[], fn: (item: T) => Promise<R>, label: string): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
      done++;
      if (done % 200 === 0 || done === items.length) console.log(`  ${label}: ${done}/${items.length}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  return out;
}

const readJson = <T>(file: string, fallback: T): T =>
  fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")) : fallback;

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const only = new Set(args.map(Number).filter(Boolean));
  fs.mkdirSync(path.join(OUT, "villages"), { recursive: true });
  const started = Date.now();

  console.log("Fetching states…");
  const states = toPlaces(await lgd("stateList", {}), "stateCode", "stateNameEnglish", "stateNameLocal");
  if (states.length < 30) throw new Error(`Only ${states.length} states returned; refusing to overwrite snapshot`);
  const targets = only.size ? states.filter((s) => only.has(s.code)) : states;

  const districts = readJson<Record<string, Place[]>>(path.join(OUT, "districts.json"), {});
  const subdistricts = readJson<Record<string, Place[]>>(path.join(OUT, "subdistricts.json"), {});
  // Drop states/UTs that LGD no longer lists (e.g. after a merger).
  const validStates = new Set(states.map((s) => String(s.code)));
  for (const k of Object.keys(districts)) if (!validStates.has(k)) delete districts[k];

  for (const state of targets) {
    const done = districts[state.code] && fs.existsSync(path.join(OUT, "villages", `${state.code}.json.gz`));
    if (done && !force && !only.has(state.code)) {
      console.log(`${state.name}: already in snapshot, skipping (use --force to refetch)`);
      continue;
    }
    const t0 = Date.now();
    const dList = toPlaces(
      await lgd("districtList", { stateCode: String(state.code) }),
      "districtCode",
      "districtNameEnglish",
      "districtNameLocal",
    );
    districts[state.code] = dList;

    const subLists = await pool(
      dList,
      async (d) =>
        toPlaces(
          await lgd("subdistrictList", { districtCode: String(d.code) }),
          "subdistrictCode",
          "subdistrictNameEnglish",
          "subdistrictNameLocal",
        ),
      `${state.name} sub-districts`,
    );
    dList.forEach((d, i) => (subdistricts[d.code] = subLists[i]));

    const allSubs = subLists.flat();
    const villageLists = await pool(
      allSubs,
      async (sd) =>
        toPlaces(
          await lgd("villageList", { subDistrictCode: String(sd.code) }),
          "villageCode",
          "villageNameEnglish",
          "villageNameLocal",
        ),
      `${state.name} village lists`,
    );
    const villagesBySub: Record<string, (string | number)[][]> = {};
    let villageCount = 0;
    allSubs.forEach((sd, i) => {
      villagesBySub[sd.code] = villageLists[i].map((v) => (v.nameLocal ? [v.code, v.name, v.nameLocal] : [v.code, v.name]));
      villageCount += villageLists[i].length;
    });
    fs.writeFileSync(
      path.join(OUT, "villages", `${state.code}.json.gz`),
      zlib.gzipSync(JSON.stringify(villagesBySub), { level: 9 }),
    );
    console.log(
      `${state.name}: ${dList.length} districts, ${allSubs.length} sub-districts, ${villageCount} villages (${((Date.now() - t0) / 1000).toFixed(0)}s)`,
    );
    // Persist after every state so an interrupted run keeps its progress.
    fs.writeFileSync(path.join(OUT, "districts.json"), JSON.stringify(districts));
    fs.writeFileSync(path.join(OUT, "subdistricts.json"), JSON.stringify(subdistricts));
  }

  fs.writeFileSync(path.join(OUT, "states.json"), JSON.stringify(states));
  const villageTotal = states.reduce((sum, s) => {
    const f = path.join(OUT, "villages", `${s.code}.json.gz`);
    if (!fs.existsSync(f)) return sum;
    const data: Record<string, unknown[]> = JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString("utf-8"));
    return sum + Object.values(data).reduce((a, v) => a + v.length, 0);
  }, 0);
  const meta = {
    source: "Local Government Directory (LGD), Ministry of Panchayati Raj, Government of India",
    sourceUrl: "https://lgdirectory.gov.in",
    fetchedAt: new Date().toISOString(),
    counts: {
      states: states.length,
      districts: Object.values(districts).reduce((a, v) => a + v.length, 0),
      subdistricts: Object.values(subdistricts).reduce((a, v) => a + v.length, 0),
      villages: villageTotal,
    },
  };
  fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify(meta, null, 2));
  console.log(`Done in ${((Date.now() - started) / 60000).toFixed(1)} min`, meta.counts);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
