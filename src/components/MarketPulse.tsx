import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CalendarDays,
  ExternalLink,
  KeyRound,
  Layers,
  Lightbulb,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Store,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import {
  getMarketCommentary,
  getMarketPrices,
  getPriceHistory,
  MarketRequestError,
  type PriceHistoryPoint,
  type MandiPrices,
  type MandiRecord,
  type MarketCommentary,
} from "@/src/services/marketService";
import { cn, formatCurrency } from "@/src/lib/utils";
import { useLanguage } from "../contexts/LanguageContext";

const fmt = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

type SortKey = "markets" | "priceHigh" | "priceLow" | "name";
type Summary = { commodity: string; markets: number; reports: number; median: number; min: number; max: number; latest: string };

function summarise(records: MandiRecord[]): Summary[] {
  const by = new Map<string, MandiRecord[]>();
  for (const r of records) by.set(r.commodity, [...(by.get(r.commodity) ?? []), r]);
  return [...by.entries()].map(([commodity, rs]) => ({
    commodity,
    markets: new Set(rs.map((r) => r.market)).size,
    reports: rs.length,
    median: Math.round(median(rs.map((r) => r.modalPrice))),
    min: Math.min(...rs.map((r) => r.minPrice)),
    max: Math.max(...rs.map((r) => r.maxPrice)),
    latest: rs.map((r) => r.arrivalDate).sort().at(-1)!,
  }));
}

export default function MarketPulse({ selectedState, setSelectedState }: { selectedState: string; setSelectedState?: (s: string) => void }) {
  const { t, language } = useLanguage();
  const tm = t.marketPage;
  const locale = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-IN";
  const date = (iso: string) => new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

  const [prices, setPrices] = useState<MandiPrices | null>(null);
  const [error, setError] = useState<MarketRequestError | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [commentary, setCommentary] = useState<MarketCommentary | null>(null);
  const [commentaryState, setCommentaryState] = useState<"loading" | "done" | "error">("loading");

  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("");
  const [sort, setSort] = useState<SortKey>("markets");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setPrices(null);
    setSelected(null);
    setDistrict("");
    getMarketPrices(selectedState, controller.signal)
      .then(setPrices)
      .catch((e) => {
        if (e?.name !== "AbortError") setError(e instanceof MarketRequestError ? e : new MarketRequestError("UPSTREAM", String(e)));
      })
      .finally(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, [selectedState, attempt]);

  useEffect(() => {
    const controller = new AbortController();
    setCommentaryState("loading");
    setCommentary(null);
    getMarketCommentary(selectedState, controller.signal)
      .then((c) => {
        setCommentary(c);
        setCommentaryState("done");
      })
      .catch((e) => e?.name !== "AbortError" && setCommentaryState("error"));
    return () => controller.abort();
  }, [selectedState, attempt]);

  const ok = prices?.status === "ok" ? prices : null;
  // Whole days between the latest reported arrival date and today (local time).
  const ageDays = ok ? Math.max(0, Math.round((new Date(new Date().toDateString()).getTime() - new Date(ok.latestArrivalDate + "T00:00:00").getTime()) / 86400000)) : 0;
  const records = useMemo(() => (ok ? ok.records.filter((r) => !district || r.district === district) : []), [ok, district]);
  const summaries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = summarise(records).filter((s) => !q || s.commodity.toLowerCase().includes(q));
    const sorters: Record<SortKey, (a: Summary, b: Summary) => number> = {
      markets: (a, b) => b.markets - a.markets || a.commodity.localeCompare(b.commodity),
      priceHigh: (a, b) => b.median - a.median,
      priceLow: (a, b) => a.median - b.median,
      name: (a, b) => a.commodity.localeCompare(b.commodity),
    };
    return list.sort(sorters[sort]);
  }, [records, query, sort]);
  const active = summaries.find((s) => s.commodity === selected) ?? summaries[0] ?? null;
  const activeRecords = useMemo(
    () => (active ? records.filter((r) => r.commodity === active.commodity).sort((a, b) => b.modalPrice - a.modalPrice) : []),
    [records, active],
  );

  // Daily state-wide trend for the selected commodity (available from the keyless mirror only).
  const [history, setHistory] = useState<{ status: "idle" | "loading" | "done" | "error"; points: PriceHistoryPoint[] }>({ status: "idle", points: [] });
  const activeName = active?.commodity;
  useEffect(() => {
    if (!ok || !activeName || ok.provider === "data_gov_in") {
      setHistory({ status: "idle", points: [] });
      return;
    }
    const controller = new AbortController();
    setHistory({ status: "loading", points: [] });
    getPriceHistory(selectedState, activeName, ok.latestArrivalDate, ok.provider, controller.signal)
      .then((points) => setHistory({ status: "done", points }))
      .catch((e) => e?.name !== "AbortError" && setHistory({ status: "error", points: [] }));
    return () => controller.abort();
  }, [ok?.provider, ok?.latestArrivalDate, selectedState, activeName]);
  const trend = history.points.slice(-30);
  const [showAllMarkets, setShowAllMarkets] = useState(false);
  useEffect(() => setShowAllMarkets(false), [activeName, district]);
  const tableRows = showAllMarkets ? activeRecords : activeRecords.slice(0, 10);
  const trendChange =
    trend.length >= 2 ? ((trend[trend.length - 1].avgModal - trend[0].avgModal) / trend[0].avgModal) * 100 : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-1">{tm.eyebrow}</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{tm.title}</h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" /> {fmt(tm.subtitle, { state: selectedState })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ok && (
            <span
              className={cn(
                "px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5",
                ageDays > 3 ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-white border-gray-200 text-gray-700",
              )}
              data-testid="price-age"
            >
              <CalendarDays className={cn("w-4 h-4", ageDays > 3 ? "text-amber-600" : "text-emerald-600")} />
              {fmt(tm.pricesFor, { date: date(ok.latestArrivalDate) })}
              {ageDays > 0 && <span className="font-medium">· {ageDays === 1 ? tm.age.one : fmt(tm.age.many, { n: ageDays })}</span>}
            </span>
          )}
          <button
            onClick={() => setAttempt((a) => a + 1)}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 disabled:opacity-60"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> {tm.refresh}
          </button>
        </div>
      </div>

      {/* Prices */}
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={() => setAttempt((a) => a + 1)} />
      ) : !ok ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 flex gap-3 items-start" role="status">
          <Store className="w-6 h-6 text-gray-400 shrink-0" />
          <div>
            <p className="font-bold text-gray-900">{fmt(tm.states.noData, { state: selectedState })}</p>
            <SourceLine source={prices?.source} />
          </div>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi icon={Layers} label={tm.kpi.commodities} value={summarise(records).length.toLocaleString(locale)} />
            <Kpi icon={Store} label={tm.kpi.markets} value={new Set(records.map((r) => r.market)).size.toLocaleString(locale)} />
            <Kpi icon={BarChart3} label={tm.kpi.reports} value={records.length.toLocaleString(locale)} />
            <Kpi icon={CalendarDays} label={tm.kpi.latestDate} value={date(ok.latestArrivalDate)} />
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl border border-gray-200 p-3 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3">
            <label className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tm.search}
                aria-label={tm.search}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              aria-label={tm.allDistricts}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">{tm.allDistricts}</option>
              {ok.districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label={tm.sortLabel}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="markets">{tm.sort.markets}</option>
              <option value="priceHigh">{tm.sort.priceHigh}</option>
              <option value="priceLow">{tm.sort.priceLow}</option>
              <option value="name">{tm.sort.name}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Commodity board */}
            <section className="xl:col-span-7 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-w-0" aria-label={tm.board}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-2">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-600" /> {tm.board}</h3>
                <span className="text-[11px] text-gray-400 font-medium">{tm.unit}</span>
              </div>
              {summaries.length === 0 ? (
                <p className="px-5 py-6 text-sm text-gray-500">{tm.noMatch}</p>
              ) : (
                <ul className="divide-y divide-gray-100 max-h-[640px] overflow-y-auto" data-testid="commodity-board">
                  {summaries.map((s) => {
                    const isActive = active?.commodity === s.commodity;
                    const span = s.max - s.min || 1;
                    return (
                      <li key={s.commodity}>
                        <button
                          onClick={() => setSelected(s.commodity)}
                          aria-pressed={isActive}
                          className={cn(
                            "w-full text-left px-5 py-3 grid grid-cols-[1fr_auto] md:grid-cols-[minmax(0,1.3fr)_auto_minmax(0,1.2fr)] gap-x-4 gap-y-1 items-center transition-colors",
                            isActive ? "bg-emerald-50/70" : "hover:bg-gray-50",
                          )}
                        >
                          <span className="min-w-0">
                            <span className={cn("block font-bold truncate", isActive ? "text-emerald-800" : "text-gray-900")}>{s.commodity}</span>
                            <span className="block text-[11px] text-gray-400">{s.markets === 1 ? tm.marketOne : fmt(tm.marketsCount, { n: s.markets })} · {date(s.latest)}</span>
                          </span>
                          <span className="text-right">
                            <span className="block font-black text-gray-900 tabular-nums">{formatCurrency(s.median)}</span>
                            <span className="block text-[10px] text-gray-400 uppercase tracking-wider">{tm.median}</span>
                          </span>
                          <span className="col-span-2 md:col-span-1 min-w-0">
                            <span className="relative block h-2 rounded-full bg-gray-100" aria-hidden="true">
                              <span className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-emerald-100 via-emerald-300 to-emerald-500" />
                              <span
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-900 ring-2 ring-white"
                                style={{ left: `${((s.median - s.min) / span) * 100}%` }}
                              />
                            </span>
                            <span className="mt-1 flex justify-between text-[10px] text-gray-500 tabular-nums">
                              <span>{formatCurrency(s.min)}</span>
                              <span>{formatCurrency(s.max)}</span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="px-5 py-3 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
                <p>{tm.modalExplain}</p>
                {ok.truncated && <p>{fmt(tm.truncated, { n: ok.records.length })}</p>}
              </div>
            </section>

            {/* Selected commodity */}
            <section className="xl:col-span-5 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-w-0" aria-label={tm.detail}>
              {active ? (
                <>
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{tm.detail}</p>
                    <h3 className="text-xl font-black text-gray-900 mt-0.5">{active.commodity}</h3>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <MiniStat label={tm.colMin} value={formatCurrency(active.min)} />
                      <MiniStat label={tm.median} value={formatCurrency(active.median)} strong />
                      <MiniStat label={tm.colMax} value={formatCurrency(active.max)} />
                    </div>
                  </div>
                  {ok.provider !== "data_gov_in" && (
                    <div className="px-5 pt-4 space-y-2" data-testid="price-trend">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-gray-900">{tm.trend.title}</p>
                          <p className="text-[10px] text-gray-400">{tm.trend.note}</p>
                        </div>
                        {trendChange !== null && (
                          <span className={cn("text-xs font-black px-2 py-0.5 rounded-full whitespace-nowrap", trendChange >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                            {trendChange >= 0 ? "+" : ""}{trendChange.toFixed(1)}% · {fmt(tm.trend.days, { n: trend.length })}
                          </span>
                        )}
                      </div>
                      {history.status === "loading" ? (
                        <div className="h-32 rounded-xl bg-gray-50 animate-pulse" />
                      ) : trend.length >= 2 ? (
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend.map((p) => ({ ...p, label: date(p.date) }))} margin={{ left: 0, right: 4, top: 4 }}>
                              <defs>
                                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid vertical={false} stroke="#f3f4f6" />
                              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} minTickGap={24} />
                              <YAxis width={44} tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                              <Tooltip
                                formatter={(v: any) => [formatCurrency(Number(v)), tm.trend.avgModal]}
                                contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                              />
                              <Area type="monotone" dataKey="avgModal" stroke="#047857" strokeWidth={2} fill="url(#trendFill)" animationDuration={400} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">{tm.trend.unavailable}</p>
                      )}
                    </div>
                  )}
                  <div className="px-3 pt-4" style={{ height: Math.max(120, Math.min(activeRecords.length, 10) * 36 + 40) }} data-testid="market-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeRecords.slice(0, 10).map((r) => ({ name: r.market, modal: r.modalPrice }))} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid horizontal={false} stroke="#f3f4f6" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 10, fill: "#4b5563" }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: any) => [formatCurrency(Number(v)), tm.colModal]} cursor={{ fill: "#ecfdf5" }} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                        <Bar dataKey="modal" radius={[0, 6, 6, 0]} barSize={14} animationDuration={400}>
                          {activeRecords.slice(0, 10).map((r, i) => (
                            <Cell key={i} fill={i === 0 ? "#047857" : "#34d399"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs" data-testid="market-table">
                      <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500">
                        <tr>
                          <th className="text-left px-4 py-2">{tm.colMarket}</th>
                          <th className="text-left px-2 py-2 hidden sm:table-cell">{tm.colVariety}</th>
                          <th className="text-right px-2 py-2">{tm.colMin}</th>
                          <th className="text-right px-2 py-2">{tm.colModal}</th>
                          <th className="text-right px-4 py-2">{tm.colMax}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map((r, i) => (
                          <tr key={i} className="border-t border-gray-100 align-top">
                            <td className="px-4 py-2">
                              <span className="font-bold text-gray-900">{r.market}</span>
                              <span className="block text-[10px] text-gray-400">{r.district} · {date(r.arrivalDate)}</span>
                              <span className="block sm:hidden text-[10px] text-gray-500">{[r.variety, r.grade].filter(Boolean).join(" · ")}</span>
                            </td>
                            <td className="px-2 py-2 text-gray-600 hidden sm:table-cell">{[r.variety, r.grade].filter(Boolean).join(" · ")}</td>
                            <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(r.minPrice)}</td>
                            <td className="px-2 py-2 text-right tabular-nums font-black text-emerald-800">{formatCurrency(r.modalPrice)}</td>
                            <td className="px-4 py-2 text-right tabular-nums">{formatCurrency(r.maxPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {activeRecords.length > 10 && (
                    <button
                      onClick={() => setShowAllMarkets((v) => !v)}
                      className="w-full px-4 py-3 border-t border-gray-100 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                    >
                      {showAllMarkets ? tm.showFewer : fmt(tm.showAll, { n: activeRecords.length })}
                    </button>
                  )}
                </>
              ) : (
                <p className="px-5 py-6 text-sm text-gray-500">{tm.noMatch}</p>
              )}
            </section>
          </div>
          <div className="space-y-1">
            {ok.provider === "community_mirror" && (
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2" data-testid="mirror-notice">
                {ok.fallbackReason && ok.fallbackReason !== "no_key" ? tm.mirror.keyIssue : tm.mirror.noKey} {tm.mirror.note}
              </p>
            )}
            {ok.provider === "github_archive" && (
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2" data-testid="mirror-notice">
                {tm.archive.note} {ageDays > 3 && fmt(tm.archive.stale, { n: ageDays, date: date(ok.latestArrivalDate) })}
              </p>
            )}
            <SourceLine source={ok.source} fetchedAt={ok.fetchedAt} syncedAt={ok.syncedAt} />
          </div>
        </>
      )}

      {/* AI commentary: clearly labelled, never the source of prices */}
      <section className="bg-emerald-950 rounded-3xl p-5 sm:p-6 text-white" aria-label={tm.ai.title} data-testid="ai-commentary">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-emerald-950" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold">{tm.ai.title}</h3>
            {commentary && (
              <p className="text-[11px] text-emerald-300/80 flex items-center gap-1">
                <Bot className="w-3.5 h-3.5" /> {commentary.basis === "mandi_data" ? tm.ai.basisData : tm.ai.basisGeneral}
              </p>
            )}
          </div>
        </div>
        {commentaryState === "loading" ? (
          <p className="text-sm text-emerald-200 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {tm.ai.loading}</p>
        ) : commentaryState === "error" || !commentary ? (
          <p className="text-sm text-emerald-200/80">{tm.ai.unavailable}</p>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <p className="lg:col-span-1 text-sm leading-relaxed text-emerald-50">{commentary.summary}</p>
            <div className="lg:col-span-1 space-y-2">
              {commentary.highlights.map((h, i) => (
                <div key={i} className="bg-emerald-900/50 border border-emerald-800/60 rounded-xl p-3">
                  <p className="text-xs font-bold text-emerald-300">{h.commodity}</p>
                  <p className="text-xs text-emerald-50/90 leading-relaxed">{h.note}</p>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">{tm.ai.advice}</p>
              <ul className="space-y-2">
                {commentary.advice.map((a, i) => (
                  <li key={i} className="flex gap-2 text-sm text-emerald-50/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );

  function SourceLine({ source, fetchedAt, syncedAt }: { source?: { name: string; url: string; official: boolean }; fetchedAt?: string; syncedAt?: string | null }) {
    const url = source?.url ?? "https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi";
    const name = source
      ? source.official
        ? tm.sourceName
        : source.url.includes("github.com")
          ? tm.archive.sourceName
          : tm.mirror.sourceName
      : tm.sourceName;
    return (
      <p className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-1">
        {tm.source}:{" "}
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">
          {name} <ExternalLink className="w-3 h-3" />
        </a>
        {syncedAt && <span>· {fmt(tm.mirror.synced, { time: new Date(syncedAt).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) })}</span>}
        {fetchedAt && <span>· {fmt(tm.fetched, { time: new Date(fetchedAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) })}</span>}
      </p>
    );
  }

  function ErrorState({ error, onRetry }: { error: MarketRequestError; onRetry: () => void }) {
    if (error.code === "NOT_CONFIGURED") {
      return (
        <div className="bg-white rounded-3xl border border-amber-200 p-5 sm:p-6 space-y-4" data-testid="market-not-configured">
          <div className="flex gap-3 items-start">
            <Store className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900">{fmt(tm.states.uncoveredTitle, { state: selectedState })}</h3>
              <p className="text-sm text-gray-600">{tm.states.uncoveredBody}</p>
            </div>
          </div>
          {error.keylessStates.length > 0 && (
            <div className="pl-9 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{tm.states.switchTo}</p>
              <div className="flex flex-wrap gap-2">
                {error.keylessStates.map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedState?.(st)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}
          <details className="pl-9 text-xs text-gray-500">
            <summary className="cursor-pointer font-bold flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" /> {tm.states.keyOptional}</summary>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              {tm.states.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </details>
        </div>
      );
    }
    const msg =
      error.code === "RATE_LIMITED"
        ? fmt(tm.states.busy, { min: Math.max(1, Math.ceil((error.retryAfterSec ?? 60) / 60)) })
        : error.code === "KEY_REJECTED"
          ? tm.states.keyRejected
          : tm.states.upstream;
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4" role="alert" data-testid="market-error">
        <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
        <p className="text-sm text-gray-700 flex-1">{msg}</p>
        <button onClick={onRetry} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700">
          <RefreshCw className="w-4 h-4" /> {tm.states.retry}
        </button>
      </div>
    );
  }
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-tight">{label}</p>
        <p className="text-lg font-black text-gray-900 truncate tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("rounded-xl px-3 py-2 border", strong ? "bg-emerald-600 border-emerald-600 text-white" : "bg-gray-50 border-gray-100 text-gray-900")}>
      <p className={cn("text-[10px] font-bold uppercase tracking-wider", strong ? "text-emerald-100" : "text-gray-400")}>{label}</p>
      <p className="text-sm font-black tabular-nums">{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4" role="status" aria-busy="true">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-[74px] bg-white rounded-2xl border border-gray-200 animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 h-80 bg-white rounded-3xl border border-gray-200 animate-pulse" />
        <div className="xl:col-span-5 h-80 bg-white rounded-3xl border border-gray-200 animate-pulse" />
      </div>
    </div>
  );
}
