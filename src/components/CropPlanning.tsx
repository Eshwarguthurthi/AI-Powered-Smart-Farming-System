import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sprout,
  Droplets,
  FlaskConical,
  Calendar,
  Coins,
  Loader2,
  CheckCircle2,
  Sun,
  Thermometer,
  ShieldAlert,
  TrendingUp,
  Activity,
  MapPin,
  Info,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  X
} from "lucide-react";
import { getCropRecommendation, CropPlanRequestError, type SoilParamInput } from "@/src/services/geminiService";
import type { CropPlanResponse } from "../../shared/cropPlan";
import CropPlanResult from "./CropPlanResult";
import CropPlanLoading from "./CropPlanLoading";
import {
  fetchStates,
  fetchDistricts,
  fetchSubdistricts,
  fetchVillages,
  fetchSoil,
  type Place,
  type SoilLookup,
  type NutrientSummary,
} from "@/src/services/locationService";
import { indianStates, normalizeStateName } from "@/src/lib/indianStates";
import { cn, formatCurrency } from "@/src/lib/utils";
import { toast } from "sonner";
import SearchableSelect, { type SelectOption } from "./SearchableSelect";

import { useLanguage } from '../contexts/LanguageContext';

type SoilKey = "n" | "p" | "k" | "ph";
const SOIL_KEYS: SoilKey[] = ["n", "p", "k", "ph"];

// Same plausibility bounds as the server (server/cropInput.ts): N, P, K in kg/ha as printed on a
// Soil Health Card. They catch typos and unit mix-ups, not agronomic ratings.
const SOIL_BOUNDS: Record<SoilKey, { min: number; max: number; step: number }> = {
  n: { min: 0, max: 2000, step: 1 },
  p: { min: 0, max: 1000, step: 0.1 },
  k: { min: 0, max: 3000, step: 1 },
  ph: { min: 3, max: 10, step: 0.1 },
};

const fmt = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

// Same-named places (common for villages) get their LGD code shown so the farmer can tell them apart.
const toOptions = (places: Place[]): SelectOption[] => {
  const counts = new Map<string, number>();
  for (const p of places) counts.set(p.name.toLowerCase(), (counts.get(p.name.toLowerCase()) ?? 0) + 1);
  return places.map((p) => {
    const dup = (counts.get(p.name.toLowerCase()) ?? 0) > 1;
    const sublabel = [p.nameLocal, dup ? `LGD ${p.code}` : null].filter(Boolean).join(" · ");
    return { value: p.code, label: p.name, sublabel: sublabel || undefined };
  });
};


function usePlaces(key: string | null, load: (signal: AbortSignal) => Promise<Place[]>) {
  const [state, setState] = useState<{ items: Place[]; loading: boolean; error: string | null }>({
    items: [],
    loading: false,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!key) {
      setState({ items: [], loading: false, error: null });
      return;
    }
    const controller = new AbortController();
    setState({ items: [], loading: true, error: null });
    load(controller.signal)
      .then((items) => setState({ items, loading: false, error: null }))
      .catch((e) => {
        if (!controller.signal.aborted) setState({ items: [], loading: false, error: e.message });
      });
    return () => controller.abort();
  }, [key, attempt]);

  return { ...state, retry: () => setAttempt((a) => a + 1) };
}

type SoilState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; data: SoilLookup }
  | { status: "error"; error: string };

type FieldStatus =
  | { kind: "manual"; value: number; valid: boolean }
  | { kind: "area"; area: NutrientSummary }
  | { kind: "missing" };

export default function CropPlanning({
  selectedState,
  setSelectedState,
}: {
  selectedState: string;
  setSelectedState: (state: string) => void;
}) {
  const { t, language } = useLanguage();
  const tl = t.planning.location;
  const ts = t.planning.soil;
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [plan, setPlan] = useState<CropPlanResponse | null>(null);
  const [planError, setPlanError] = useState<CropPlanRequestError | null>(null);
  // Results always use the acreage currently entered (per-acre figures come from the server).
  const [planAcres, setPlanAcres] = useState(1);
  const [season, setSeason] = useState("Winter");
  const [acres, setAcres] = useState("1");

  // Location (LGD codes)
  const states = usePlaces("states", fetchStates);
  const lgdState = states.items.find((s) => normalizeStateName(s.name) === normalizeStateName(selectedState));
  const stateCode = lgdState?.code ?? null;
  const [district, setDistrict] = useState<Place | null>(null);
  const [subdistrict, setSubdistrict] = useState<Place | null>(null);
  const [village, setVillage] = useState<Place | null>(null);

  const districts = usePlaces(stateCode ? `d:${stateCode}` : null, (s) => fetchDistricts(stateCode!, s));
  const subdistricts = usePlaces(district ? `sd:${district.code}` : null, (s) => fetchSubdistricts(district!.code, s));
  const villages = usePlaces(subdistrict ? `v:${subdistrict.code}` : null, (s) => fetchVillages(subdistrict!.code, s));

  // The state can also change from the sidebar; dependent levels must reset either way.
  useEffect(() => {
    setDistrict(null);
    setSubdistrict(null);
    setVillage(null);
    setPlan(null);
    setPlanError(null);
  }, [stateCode]);

  // Soil: retrieved automatically for the selected location. Values from the farmer's own soil
  // test report (optional) override the area estimate for that nutrient.
  const [manual, setManual] = useState<Record<SoilKey, string>>({ n: "", p: "", k: "", ph: "" });
  const [showOwnReport, setShowOwnReport] = useState(false);
  const [soil, setSoil] = useState<SoilState>({ status: "idle" });
  const [soilAttempt, setSoilAttempt] = useState(0);
  const soilRequest = useRef(0);

  useEffect(() => {
    if (!stateCode || !district) {
      setSoil({ status: "idle" });
      return;
    }
    // Abort the previous request and ignore any response that is not for the latest location.
    const requestId = ++soilRequest.current;
    const controller = new AbortController();
    setSoil({ status: "loading" });
    fetchSoil({ stateCode, districtCode: district.code, villageCode: village?.code }, controller.signal)
      .then((data) => {
        if (requestId === soilRequest.current) setSoil({ status: "done", data });
      })
      .catch((e) => {
        if (!controller.signal.aborted && requestId === soilRequest.current) setSoil({ status: "error", error: e.message });
      });
    return () => controller.abort();
  }, [stateCode, district?.code, village?.code, soilAttempt]);

  const [locationMeta, setLocationMeta] = useState<{ fetchedAt?: string } | null>(null);
  useEffect(() => {
    fetch("/api/locations/meta")
      .then((r) => (r.ok ? r.json() : null))
      .then(setLocationMeta)
      .catch(() => setLocationMeta(null));
  }, []);

  const areaData = soil.status === "done" && soil.data.status === "available" ? soil.data : null;

  const fieldStatus = (key: SoilKey): FieldStatus => {
    const raw = manual[key].trim();
    if (raw !== "") {
      const value = Number(raw);
      const { min, max } = SOIL_BOUNDS[key];
      return { kind: "manual", value, valid: Number.isFinite(value) && value >= min && value <= max };
    }
    const area = areaData?.nutrients[key];
    return area ? { kind: "area", area } : { kind: "missing" };
  };
  const fields = Object.fromEntries(SOIL_KEYS.map((k) => [k, fieldStatus(k)])) as Record<SoilKey, FieldStatus>;
  const acresNum = Number(acres);
  const acresValid = Number.isFinite(acresNum) && acresNum > 0 && acresNum <= 100000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // one request at a time
    const soilInvalid = SOIL_KEYS.some((k) => fields[k].kind === "manual" && !(fields[k] as any).valid);
    if (soilInvalid) {
      setShowOwnReport(true);
      toast.error(ts.fixErrors);
      return;
    }
    if (!acresValid) {
      toast.error(t.planning.acresInvalid);
      return;
    }

    const soilPayload = Object.fromEntries(
      SOIL_KEYS.map((k) => {
        const f = fields[k];
        return [k, f.kind === "manual" ? { value: f.value } : f.kind === "area" ? { area: f.area } : {}];
      }),
    ) as Record<SoilKey, SoilParamInput>;

    setLoading(true);
    setPlanError(null);
    // The button is at the end of a long form; bring the progress view into sight.
    requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultsRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
    try {
      const result = await getCropRecommendation({
        region: selectedState,
        season,
        location: { district: district?.name, subdistrict: subdistrict?.name, village: village?.name },
        soilContext: areaData ? { level: areaData.level, areaName: areaData.area.name, cycle: areaData.cycle } : undefined,
        soil: soilPayload,
      });
      setPlan(result);
      setPlanAcres(acresNum);
    } catch (error: any) {
      console.error(error);
      setPlan(null);
      setPlanError(
        error instanceof CropPlanRequestError ? error : new CropPlanRequestError("AI_ERROR", String(error?.message ?? error), true),
      );
    } finally {
      setLoading(false);
    }
  };

  const displayAcres = acresValid ? acresNum : planAcres;
  const dateLocale = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-IN";

  const selectStrings = {
    placeholder: tl.placeholder,
    search: tl.search,
    noMatches: tl.noMatches,
    loading: tl.loading,
    retry: tl.retry,
    showingFirst: tl.showingFirst,
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-1">{t.planning.planningTool}</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{t.planning.title}</h2>
      </div>

      {/* Inputs: two balanced cards side by side on wide screens, stacked below that */}
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-stretch">
        {/* Location + plan settings */}
        <div className="2xl:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm flex flex-col gap-5 min-w-0">
          <CardHeader icon={MapPin} title={tl.title} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-2 gap-4">
              <SearchableSelect
                label={tl.state}
                options={toOptions(states.items)}
                value={stateCode}
                onChange={(o) => {
                  if (!o) return;
                  const sidebarName = indianStates.find((n) => normalizeStateName(n) === normalizeStateName(o.label));
                  setSelectedState(sidebarName ?? o.label);
                }}
                loading={states.loading}
                error={states.error ? tl.loadError : null}
                onRetry={states.retry}
                strings={selectStrings}
              />
              <SearchableSelect
                label={tl.district}
                options={toOptions(districts.items)}
                value={district?.code ?? null}
                onChange={(o) => {
                  setDistrict(o ? districts.items.find((d) => d.code === o.value) ?? null : null);
                  setSubdistrict(null);
                  setVillage(null);
                }}
                disabled={!stateCode}
                loading={districts.loading}
                error={districts.error ? tl.loadError : null}
                onRetry={districts.retry}
                strings={selectStrings}
                hint={!stateCode ? tl.selectParentFirst : undefined}
              />
              <SearchableSelect
                label={tl.subdistrict}
                options={toOptions(subdistricts.items)}
                value={subdistrict?.code ?? null}
                onChange={(o) => {
                  setSubdistrict(o ? subdistricts.items.find((d) => d.code === o.value) ?? null : null);
                  setVillage(null);
                }}
                disabled={!district}
                loading={subdistricts.loading}
                error={subdistricts.error ? tl.loadError : null}
                onRetry={subdistricts.retry}
                strings={selectStrings}
                hint={!district ? tl.selectParentFirst : undefined}
              />
              <SearchableSelect
                label={tl.village}
                options={toOptions(villages.items)}
                value={village?.code ?? null}
                onChange={(o) => setVillage(o ? villages.items.find((v) => v.code === o.value) ?? null : null)}
                disabled={!subdistrict}
                loading={villages.loading}
                error={villages.error ? tl.loadError : null}
                onRetry={villages.retry}
                strings={selectStrings}
                hint={!subdistrict ? tl.selectParentFirst : !village ? tl.optionalVillage : undefined}
              />
          </div>
            <p className="text-[11px] text-gray-400">
              {tl.source}
              {locationMeta?.fetchedAt &&
                ` · ${new Date(locationMeta.fetchedAt).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })}`}
            </p>

          <div className="mt-auto pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-2 gap-4 items-start">
              <div className="space-y-2">
                <label htmlFor="season" className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.common.season}</label>
                <select
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="Spring">{t.planning.seasons.spring}</option>
                  <option value="Summer">{t.planning.seasons.summer}</option>
                  <option value="Autumn">{t.planning.seasons.autumn}</option>
                  <option value="Winter">{t.planning.seasons.winter}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="acres" className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.common.acres}</label>
                <input
                  id="acres"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  value={acres}
                  onChange={(e) => setAcres(e.target.value)}
                  aria-invalid={!acresValid}
                  className={cn(
                    "w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all",
                    acresValid ? "border-gray-200" : "border-rose-300",
                  )}
                />
                {!acresValid && <p className="text-[11px] text-rose-600">{t.planning.acresInvalid}</p>}
              </div>
            <div className="sm:col-span-2 lg:col-span-1 2xl:col-span-2 lg:pt-6 2xl:pt-0">
            <button
              id="generate-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white rounded-2xl py-3.5 font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> {t.common.loading}
                </>
              ) : (
                t.planning.optimizeBtn
              )}
            </button>
            </div>
          </div>
        </div>

        {/* Soil */}
        <div className="2xl:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm flex flex-col gap-5 min-w-0">
          <CardHeader icon={FlaskConical} title={ts.title} />
            <SoilSourcePanel
              soil={soil}
              onRetry={() => setSoilAttempt((a) => a + 1)}
              dateLocale={dateLocale}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SOIL_KEYS.map((k) => (
                <div key={k}>
                  <SoilValue
                    label={{ n: t.planning.soilN, p: t.planning.soilP, k: t.planning.soilK, ph: t.planning.soilPh }[k]}
                    status={fields[k]}
                    unit={k === "ph" ? "" : ts.unit}
                    loading={soil.status === "loading"}
                  />
                </div>
              ))}
            </div>

            {/* Optional: the farmer's own soil test report */}
            <div className="rounded-2xl border border-gray-100">
              <button
                type="button"
                onClick={() => setShowOwnReport((v) => !v)}
                aria-expanded={showOwnReport}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 text-xs font-bold text-gray-600 hover:text-emerald-700"
              >
                <span>{ts.ownReportToggle}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", showOwnReport && "rotate-180")} />
              </button>
              {showOwnReport && (
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-[11px] text-gray-500">{ts.ownReportHint}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SOIL_KEYS.map((k) => (
                      <div key={k}>
                        <ReportInput
                          soilKey={k}
                          label={{ n: t.planning.soilN, p: t.planning.soilP, k: t.planning.soilK, ph: t.planning.soilPh }[k]}
                          raw={manual[k]}
                          invalid={fields[k].kind === "manual" && !(fields[k] as any).valid}
                          onChange={(v) => setManual((m) => ({ ...m, [k]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {soil.status !== "loading" && SOIL_KEYS.every((k) => fields[k].kind === "missing") && (
              <p className="flex gap-2 items-start text-[11px] text-gray-500">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {ts.noSoilWarning}
              </p>
            )}
        </div>
      </form>

      {/* Results / Recommendation Area: full width, sized by its content */}
      <section ref={resultsRef} className="min-w-0 scroll-mt-20 lg:scroll-mt-8" aria-label={t.planning.recommendation}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={loading ? "loading" : planError ? "error" : plan ? `plan-${plan.generatedAt}` : "empty"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {loading ? (
                <CropPlanLoading />
              ) : planError ? (
                <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 space-y-4" role="alert" data-testid="plan-error">
                  <div className="flex gap-3 items-start">
                    <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900">{t.planning.result.errorTitle}</h3>
                      <p className="text-sm text-gray-700">{t.planning.result.errors[planError.code] ?? t.planning.result.errors.AI_ERROR}</p>
                      <p className="text-xs text-gray-400">{planError.message}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => (document.getElementById("generate-btn") as HTMLButtonElement | null)?.click()}
                    className="px-5 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> {t.planning.result.retry}
                  </button>
                </div>
              ) : plan ? (
                <CropPlanResult plan={plan} acres={displayAcres} />
              ) : (
                <div className="flex items-center gap-4 border-2 border-dashed border-gray-200 rounded-3xl p-5 sm:p-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Sprout className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900">{t.planning.awaitingInput}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{t.planning.awaitingInputDesc}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
      </section>

      {/* Regional Knowledge Base */}
      <div className="pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{t.planning.knowledgeBase}</h3>
            <p className="text-sm text-gray-500 font-medium">{t.planning.knowledgeBaseDesc} {selectedState}.</p>
          </div>
          <div className="p-3 bg-emerald-950 text-emerald-400 rounded-2xl shadow-xl shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KnowledgeCard
            title={t.planning.stapleCrops}
            crops={["Paddy", "Wheat", "Maize"]}
            desc="Primary nutritional crops with high food security value and established procurement channels."
          />
          <KnowledgeCard
            title={t.planning.cashCrops}
            crops={["Sugarcane", "Cotton", "Tobacco"]}
            desc="High commercial focus crops requiring specialized input management and industrial linkage."
          />
          <KnowledgeCard
            title={t.planning.horticulture}
            crops={["Mango", "Banana", "Citrus"]}
            desc="Perennial investment crops with potential for high export value and processing opportunities."
          />
          <KnowledgeCard
            title={t.planning.soilBoosters}
            crops={["Moong", "Urad", "Mustard"]}
            desc="Short-duration crops that naturally replenish soil nitrogen and require minimal irrigation."
          />
        </div>
      </div>
    </div>
  );
}

function CardHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
      <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-gray-900">{title}</h3>
    </div>
  );
}

function SoilSourcePanel({
  soil,
  onRetry,
  dateLocale,
}: {
  soil: SoilState;
  onRetry: () => void;
  dateLocale: string;
}) {
  const { t } = useLanguage();
  const ts = t.planning.soil;

  if (soil.status === "idle") {
    return (
      <div className="flex gap-3 items-start bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs text-gray-600 leading-relaxed">
        <Info className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
        <p>{ts.idleHint}</p>
      </div>
    );
  }
  if (soil.status === "loading") {
    return (
      <div className="flex gap-3 items-center bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-xs font-medium text-emerald-800" role="status">
        <Loader2 className="w-4 h-4 animate-spin" /> {ts.fetching}
      </div>
    );
  }
  const unavailable = soil.status === "done" && soil.data.status === "unavailable" ? soil.data : null;
  if (soil.status === "error" || unavailable) {
    const message = unavailable ? ts.unavailable[unavailable.reason] : ts.unavailable.error;
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2" role="alert">
        <div className="flex gap-3 items-start">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">{message}</p>
            <p>{ts.nextStep}</p>
          </div>
        </div>
        {soil.status === "error" && (
          <button type="button" onClick={onRetry} className="ml-7 font-bold flex items-center gap-1 hover:underline">
            <RefreshCw className="w-3 h-3" /> {ts.retry}
          </button>
        )}
      </div>
    );
  }

  if (soil.status !== "done" || soil.data.status !== "available") return null;
  const d = soil.data;
  return (
    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="font-black text-emerald-900 uppercase tracking-widest text-[10px]">{ts.summaryTitle}</p>
        <SourceBadge kind="area" />
      </div>
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-emerald-950">
        <div>
          <dt className="text-[10px] text-emerald-700/70 font-bold uppercase tracking-wider">{ts.area}</dt>
          <dd className="font-bold">{d.area.name} <span className="font-medium text-emerald-700">({ts.levels[d.level]})</span></dd>
        </div>
        <div>
          <dt className="text-[10px] text-emerald-700/70 font-bold uppercase tracking-wider">{ts.cycle}</dt>
          <dd className="font-bold">{d.cycle}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-emerald-700/70 font-bold uppercase tracking-wider">{ts.samples}</dt>
          <dd className="font-bold">{d.sampleCount.toLocaleString(dateLocale)}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-emerald-700/70 font-bold uppercase tracking-wider">{ts.lastProcessed}</dt>
          <dd className="font-bold">{d.lastUpdated ? new Date(d.lastUpdated).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" }) : "—"}</dd>
        </div>
      </dl>
      {d.fallbackReason && (
        <p className="flex gap-2 items-start bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" /> {ts.fallback[d.fallbackReason]}
        </p>
      )}
      <p className="text-emerald-900/80 leading-relaxed">{ts.unitsNote} {ts.disclaimer}</p>
      <p className="text-[10px] text-emerald-700/70">
        {ts.source}:{" "}
        <a href={d.source.url} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">
          {d.source.name} <ExternalLink className="w-3 h-3" />
        </a>
      </p>
    </div>
  );
}

function SourceBadge({ kind }: { kind: "area" | "manual" | "missing" }) {
  const { t } = useLanguage();
  const ts = t.planning.soil;
  const styles = {
    area: "bg-emerald-100 text-emerald-800 border-emerald-200",
    manual: "bg-blue-100 text-blue-800 border-blue-200",
    missing: "bg-gray-100 text-gray-500 border-gray-200",
  };
  const label = { area: ts.badgeEstimate, manual: ts.badgeManual, missing: ts.badgeUnavailable }[kind];
  return (
    <span className={cn("px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap shrink-0", styles[kind])}>{label}</span>
  );
}

const RATING_COLORS: Record<string, string> = {
  Low: "bg-rose-400",
  Medium: "bg-amber-400",
  High: "bg-emerald-500",
  Acidic: "bg-orange-400",
  Neutral: "bg-emerald-500",
  Alkaline: "bg-blue-400",
};

const RATING_TEXT: Record<string, string> = {
  Low: "text-rose-600",
  Medium: "text-amber-600",
  High: "text-emerald-700",
  Acidic: "text-orange-600",
  Neutral: "text-emerald-700",
  Alkaline: "text-blue-600",
};

// Auto-filled, read-only soil value: the area soil-test rating, the farmer's own report value, or
// an explicit "Not available". Never a made-up number.
function SoilValue({
  label,
  status,
  unit,
  loading,
}: {
  label: string;
  status: FieldStatus;
  unit: string;
  loading: boolean;
}) {
  const { t } = useLanguage();
  const ts = t.planning.soil;
  const ratingKey = (s: string) => (ts.ratings as Record<string, string>)[s] ?? s;
  const area = status.kind === "area" ? status.area : null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-2 h-full min-w-0" data-soil-field={label}>
      <div className="flex flex-col items-start gap-1.5">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
        {!loading && <SourceBadge kind={status.kind} />}
      </div>

      {loading ? (
        <div className="h-7 w-24 bg-gray-100 rounded-lg animate-pulse" role="status" aria-label={ts.fetching} />
      ) : status.kind === "manual" ? (
        <p className={cn("text-xl font-black", status.valid ? "text-blue-900" : "text-rose-600")} data-soil-value>
          {Number.isFinite(status.value) ? status.value : "—"} {unit && <span className="text-xs font-bold text-blue-700/70">{unit}</span>}
        </p>
      ) : area ? (
        <>
          <p className={cn("text-xl font-black", RATING_TEXT[area.dominant] ?? "text-gray-900")} data-soil-value>
            {ratingKey(area.dominant)}
          </p>
          <p className="text-[11px] text-gray-500">
            {fmt(ts.samplesRated, { share: area.dominantShare, total: area.total, rating: ratingKey(area.dominant) })}
          </p>
          <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100" aria-hidden="true">
            {Object.entries(area.counts).map(([cls, count]) =>
              count > 0 ? (
                <div key={cls} className={RATING_COLORS[cls] ?? "bg-gray-300"} style={{ width: `${(count / area.total) * 100}%` }} title={`${ratingKey(cls)}: ${count}`} />
              ) : null,
            )}
          </div>
          <p className="text-[10px] text-gray-400">
            {Object.entries(area.counts).map(([cls, count]) => `${ratingKey(cls)} ${count}`).join(" · ")}
          </p>
        </>
      ) : (
        <p className="text-sm font-bold text-gray-400" data-soil-value>{ts.notAvailable}</p>
      )}
    </div>
  );
}

function ReportInput({
  soilKey,
  label,
  raw,
  invalid,
  onChange,
}: {
  soilKey: SoilKey;
  label: string;
  raw: string;
  invalid: boolean;
  onChange: (value: string) => void;
}) {
  const { t } = useLanguage();
  const ts = t.planning.soil;
  const bounds = SOIL_BOUNDS[soilKey];
  const inputId = `soil-${soilKey}`;
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          inputMode="decimal"
          step={bounds.step}
          min={bounds.min}
          max={bounds.max}
          value={raw}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ts.manualPlaceholder}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${inputId}-error` : undefined}
          className={cn(
            "w-full bg-white border rounded-xl pl-4 pr-20 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all",
            invalid ? "border-rose-300" : "border-gray-200",
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {soilKey !== "ph" && <span className="text-[10px] text-gray-400 font-medium">{ts.unit}</span>}
          {raw !== "" && (
            <button type="button" onClick={() => onChange("")} className="p-1 text-gray-400 hover:text-gray-700" aria-label={ts.clear} title={ts.clear}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {invalid && (
        <p id={`${inputId}-error`} className="text-[11px] text-rose-600">{fmt(ts.outOfRange, { min: bounds.min, max: bounds.max })}</p>
      )}
    </div>
  );
}

function KnowledgeCard({ title, crops, desc }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-all">
      <h4 className="font-bold text-gray-900 mb-2">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2 mb-4">
        {crops.map((crop: string) => (
          <span key={crop} className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
            {crop}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

