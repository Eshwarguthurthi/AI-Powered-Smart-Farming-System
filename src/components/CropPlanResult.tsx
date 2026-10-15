import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  Bug,
  Calculator,
  Calendar,
  CheckCircle2,
  Coins,
  Droplets,
  FlaskConical,
  Info,
  RotateCcw,
  ShieldAlert,
  Sprout,
  Sun,
  Thermometer,
} from "lucide-react";
import { cn, formatCurrency } from "@/src/lib/utils";
import { computeFinance, type CropPlanResponse, type CropRecommendation, type SectionKey } from "../../shared/cropPlan";
import { useLanguage } from "../contexts/LanguageContext";

const fmt = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

type Override = { yieldText: string; priceText: string };

// The farmer may replace the AI's yield/price estimates; fall back to the AI values when blank.
function effectiveEconomics(crop: CropRecommendation, o?: Override) {
  const e = crop.economics;
  if (!e) return null;
  const y = Number(o?.yieldText);
  const p = Number(o?.priceText);
  return { ...e, yieldPerAcreKg: y > 0 ? y : e.yieldPerAcreKg, pricePerQuintal: p > 0 ? p : e.pricePerQuintal };
}

export default function CropPlanResult({ plan, acres }: { plan: CropPlanResponse; acres: number }) {
  const { t } = useLanguage();
  const tr = t.planning.result;
  const [selected, setSelected] = useState(0);
  const [overrides, setOverrides] = useState<Record<number, Override>>({});
  const idx = Math.min(selected, plan.crops.length - 1);
  const crop = plan.crops[idx];

  return (
    <div className="space-y-4">
      {/* What the result is based on */}
      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 flex flex-col gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-gray-500 uppercase tracking-widest text-[10px] mr-1">{tr.soilBasisTitle}:</span>
          {(["n", "p", "k", "ph"] as const).map((k) => (
            <span
              key={k}
              className={cn(
                "px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap",
                plan.soilBasis[k] === "measured"
                  ? "bg-blue-50 text-blue-800 border-blue-200"
                  : plan.soilBasis[k] === "location_estimate"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-gray-100 text-gray-500 border-gray-200",
              )}
            >
              {k === "ph" ? "pH" : k.toUpperCase()}: {tr.soilBasis[plan.soilBasis[k]]}
            </span>
          ))}
        </div>
        <p className="flex gap-2 items-start text-gray-500 leading-relaxed">
          <Bot className="w-4 h-4 shrink-0 text-gray-400" /> {fmt(tr.aiNote, { model: plan.model })}
        </p>
      </div>

      {plan.crops.length < 3 && <Notice tone="amber">{fmt(tr.partialCrops, { count: plan.crops.length })}</Notice>}

      {/* The recommended crops side by side; the selected one is shown in detail below */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="tablist">
        {plan.crops.map((c, i) => {
          const e = effectiveEconomics(c, overrides[i]);
          const f = e ? computeFinance(e, acres).perAcre : null;
          const active = i === idx;
          return (
            <button
              key={c.cropName + i}
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(i)}
              className={cn(
                "text-left rounded-2xl border p-4 transition-all min-w-0",
                active
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "bg-white border-gray-200 hover:border-emerald-300 text-gray-900",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn("text-[10px] font-black uppercase tracking-widest", active ? "text-emerald-100" : "text-emerald-700")}>#{c.rank}</span>
                {c.suitabilityScore !== null && (
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap", active ? "bg-white/20" : "bg-emerald-50 text-emerald-800")}>
                    {tr.suitability} {c.suitabilityScore}/100
                  </span>
                )}
              </div>
              <p className="mt-1 text-lg font-black leading-tight break-words">{c.cropName}</p>
              <div className={cn("mt-3 grid grid-cols-3 gap-2 text-[11px]", active ? "text-emerald-50" : "text-gray-500")}>
                <span className="min-w-0">
                  <span className="block opacity-80 truncate">{tr.sections.duration}</span>
                  <span className="font-bold">{c.duration ? fmt(tr.days, { min: c.duration.minDays, max: c.duration.maxDays }) : tr.notProvided}</span>
                </span>
                <span className="min-w-0">
                  <span className="block opacity-80 truncate">{tr.profit}</span>
                  <span className="font-bold">{f ? formatCurrency(f.profit) : tr.notProvided}</span>
                </span>
                <span className="min-w-0">
                  <span className="block opacity-80 truncate">{tr.roi}</span>
                  <span className="font-bold">{f?.roi != null ? `${f.roi.toFixed(0)}%` : tr.notProvided}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div key={crop.cropName + crop.rank}>
        <CropDetail
          crop={crop}
          acres={acres}
          override={overrides[idx]}
          onOverride={(o) => setOverrides((prev) => ({ ...prev, [idx]: o }))}
        />
      </div>
    </div>
  );
}

function CropDetail({
  crop,
  acres,
  override,
  onOverride,
}: {
  crop: CropRecommendation;
  acres: number;
  override?: Override;
  onOverride: (o: Override) => void;
}) {
  const { t } = useLanguage();
  const tr = t.planning.result;
  const missing = crop.unavailableSections.map((s) => tr.sections[s]).join(", ");

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Hero */}
      <div className="bg-emerald-600 px-5 py-5 sm:px-8 sm:py-6 text-white">
        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">
          {t.planning.recommendation} #{crop.rank}
        </p>
        <h3 className="text-2xl sm:text-4xl font-black tracking-tight break-words mt-1">{crop.cropName}</h3>
        {crop.duration && (
          <p className="mt-2 text-sm text-emerald-50 flex flex-wrap items-center gap-x-2">
            <Calendar className="w-4 h-4" />
            {fmt(tr.days, { min: crop.duration.minDays, max: crop.duration.maxDays })} · {tr.harvestWindow}: {crop.duration.harvestWindow}
          </p>
        )}
      </div>

      <div className="p-5 sm:p-6 lg:p-8 space-y-6">
        {crop.unavailableSections.length > 0 && <Notice tone="amber">{fmt(tr.partialSections, { sections: missing })}</Notice>}

        {/* Two independent columns so each grows with its own content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <div className="space-y-6 min-w-0">
            <Section icon={CheckCircle2} title={tr.why}>
              <p className="text-emerald-900 text-sm leading-relaxed font-medium bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">{crop.rationale}</p>
            </Section>

            <Section icon={FlaskConical} title={tr.sections.soilSuitability} missing={!crop.soilSuitability}>
              <p className="text-sm text-gray-700 leading-relaxed">{crop.soilSuitability}</p>
            </Section>

            <Section icon={Coins} title={tr.sections.economics} missing={!crop.economics}>
              {crop.economics && <Economics crop={crop} acres={acres} override={override} onOverride={onOverride} />}
            </Section>
          </div>

          <div className="space-y-6 min-w-0">
            <Section icon={Calendar} title={tr.sections.timeline} missing={!crop.timeline}>
              {crop.timeline && <Timeline crop={crop} />}
            </Section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard icon={Droplets} color="blue" title={tr.sections.water} missing={!crop.water}>
                {crop.water && (
                  <>
                    <Field label={tr.requirement}>{crop.water.requirement}</Field>
                    <Field label={tr.irrigation}>{crop.water.irrigation}</Field>
                  </>
                )}
              </InfoCard>
              <InfoCard icon={Sun} color="amber" title={tr.sections.climate} missing={!crop.climate}>
                {crop.climate && (
                  <>
                    <Field label={tr.temperature} icon={Thermometer}>{crop.climate.temperature}</Field>
                    <Field label={tr.sunlight} icon={Sun}>{crop.climate.sunlight}</Field>
                  </>
                )}
              </InfoCard>
            </div>

            <Section icon={Sprout} title={tr.sections.fertilizer} missing={!crop.fertilizer}>
              {crop.fertilizer && (
                <div className="space-y-2">
                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500">
                        <tr>
                          <th className="text-left px-3 py-2">{tr.nutrient}</th>
                          <th className="text-left px-3 py-2">{tr.product}</th>
                          <th className="text-right px-3 py-2 whitespace-nowrap">{tr.quantity}</th>
                          <th className="text-left px-3 py-2">{tr.timing}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {crop.fertilizer.items.map((f, i) => (
                          <tr key={i} className="border-t border-gray-100 align-top">
                            <td className="px-3 py-2 font-bold">{f.nutrient}</td>
                            <td className="px-3 py-2">{f.product}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap">{f.quantityPerAcre} {f.unit}</td>
                            <td className="px-3 py-2 text-gray-600">{f.timing}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {crop.fertilizer.notes && <p className="text-xs text-gray-500">{crop.fertilizer.notes}</p>}
                </div>
              )}
            </Section>
          </div>
        </div>

        <Section icon={ShieldAlert} title={tr.sections.pests} missing={!crop.pests}>
          {crop.pests && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {crop.pests.map((p, i) => (
                <div key={i} className="bg-rose-50 rounded-2xl p-4 border border-rose-100 space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-rose-900 text-sm flex items-start gap-2 min-w-0">
                      <Bug className="w-4 h-4 shrink-0 mt-0.5" /> <span className="break-words">{p.name}</span>
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/70 text-rose-800 px-2 py-0.5 rounded-full shrink-0">
                      {p.type === "pest" ? tr.pest : tr.disease}
                    </span>
                  </div>
                  <Field label={tr.prevention}>{p.prevention}</Field>
                  <Field label={tr.treatment}>{p.treatment}</Field>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section icon={AlertTriangle} title={tr.sections.risks} missing={!crop.risks}>
          {crop.risks && (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {crop.risks.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function Economics({
  crop,
  acres,
  override,
  onOverride,
}: {
  crop: CropRecommendation;
  acres: number;
  override?: Override;
  onOverride: (o: Override) => void;
}) {
  const { t } = useLanguage();
  const tr = t.planning.result;
  const e = crop.economics!;
  const yieldText = override?.yieldText ?? String(e.yieldPerAcreKg);
  const priceText = override?.priceText ?? String(e.pricePerQuintal);
  const eff = effectiveEconomics(crop, { yieldText, priceText })!;
  const edited = eff.yieldPerAcreKg !== e.yieldPerAcreKg || eff.pricePerQuintal !== e.pricePerQuintal;
  const { perAcre, total } = computeFinance(eff, acres);
  const kg = (v: number) => `${Math.round(v).toLocaleString("en-IN")} kg`;
  const roi = (v: number | null) => (v === null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`);

  const rows: { label: string; a: string; b: string; tone?: string }[] = [
    { label: tr.yield, a: kg(perAcre.yieldKg), b: kg(total.yieldKg) },
    { label: tr.investment, a: formatCurrency(perAcre.investment), b: formatCurrency(total.investment) },
    { label: tr.revenue, a: formatCurrency(perAcre.revenue), b: formatCurrency(total.revenue) },
    { label: tr.profit, a: formatCurrency(perAcre.profit), b: formatCurrency(total.profit), tone: perAcre.profit < 0 ? "text-rose-700" : "text-emerald-800" },
    { label: tr.roi, a: roi(perAcre.roi), b: roi(total.roi), tone: (perAcre.roi ?? 0) < 0 ? "text-rose-700" : "text-blue-800" },
  ];

  return (
    <div className="space-y-3" data-testid="economics">
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="text-left px-3 py-2" />
              <th className="text-right px-3 py-2">{tr.perAcre}</th>
              <th className="text-right px-3 py-2">{fmt(tr.total, { acres })}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-gray-100" data-row={r.label}>
                <td className="px-3 py-2 font-bold text-gray-700">{r.label}</td>
                <td className={cn("px-3 py-2 text-right font-black whitespace-nowrap", r.tone)}>{r.a}</td>
                <td className={cn("px-3 py-2 text-right font-black whitespace-nowrap", r.tone)}>{r.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="space-y-1 min-w-0">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{tr.yieldInput}</span>
          <input type="number" min={1} inputMode="decimal" value={yieldText} onChange={(ev) => onOverride({ yieldText: ev.target.value, priceText })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
        </label>
        <label className="space-y-1 min-w-0">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{tr.priceInput}</span>
          <input type="number" min={1} inputMode="decimal" value={priceText} onChange={(ev) => onOverride({ yieldText, priceText: ev.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
        </label>
      </div>
      {edited && (
        <button type="button" onClick={() => onOverride({ yieldText: String(e.yieldPerAcreKg), priceText: String(e.pricePerQuintal) })}
          className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline">
          <RotateCcw className="w-3 h-3" /> {tr.resetEstimates}
        </button>
      )}

      <details className="rounded-2xl border border-gray-100 px-3 py-2 text-sm">
        <summary className="font-bold text-gray-700 cursor-pointer">{tr.costBreakdown}</summary>
        <ul className="mt-2 space-y-1">
          {e.costPerAcre.map((c, i) => (
            <li key={i} className="flex justify-between gap-4 text-gray-600">
              <span>{c.item}</span>
              <span className="font-bold whitespace-nowrap">{formatCurrency(c.amount)}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className="text-xs text-gray-500 space-y-1">
        <p><span className="font-bold">{tr.assumptions} – {tr.yieldBasis}:</span> {e.yieldAssumptions}</p>
        <p><span className="font-bold">{tr.assumptions} – {tr.priceBasis}:</span> {e.priceBasis}</p>
        <p className="flex gap-2 items-start pt-1"><Calculator className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {tr.econNote}</p>
      </div>
    </div>
  );
}

function Timeline({ crop }: { crop: CropRecommendation }) {
  const { t } = useLanguage();
  const tr = t.planning.result;
  const stages = crop.timeline!;
  const end = Math.max(...stages.map((s) => s.endDay), 1);
  return (
    <ol className="space-y-3" data-testid="timeline">
      {stages.map((s, i) => (
        <li key={i} className="grid grid-cols-[auto_1fr] gap-3">
          <span className="w-7 h-7 rounded-xl bg-emerald-500 text-white text-xs font-black flex items-center justify-center">{i + 1}</span>
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 flex flex-wrap gap-x-2">
              {s.stage} <span className="font-medium text-gray-400">{fmt(tr.dayRange, { start: s.startDay, end: s.endDay })}</span>
            </p>
            <div className="h-1.5 bg-gray-100 rounded-full relative overflow-hidden" aria-hidden="true">
              <div className="absolute h-full bg-emerald-400 rounded-full"
                style={{ left: `${(s.startDay / end) * 100}%`, width: `${Math.max(((s.endDay - s.startDay) / end) * 100, 2)}%` }} />
            </div>
            <p className="text-xs text-gray-600">{s.activities}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Section({ icon: Icon, title, missing, children }: { icon: any; title: string; missing?: boolean; children?: any }) {
  const { t } = useLanguage();
  return (
    <section className="space-y-3 min-w-0" data-section={title}>
      <h4 className="flex items-center gap-2 font-black text-gray-900 text-sm uppercase tracking-widest">
        <Icon className="w-5 h-5 text-emerald-500" /> {title}
      </h4>
      {missing ? <NotProvided text={t.planning.result.notProvided} /> : children}
    </section>
  );
}

function InfoCard({ icon: Icon, color, title, missing, children }: { icon: any; color: "blue" | "amber"; title: string; missing?: boolean; children?: any }) {
  const { t } = useLanguage();
  const colors = { blue: "bg-blue-50 border-blue-100 text-blue-900", amber: "bg-amber-50 border-amber-100 text-amber-900" };
  return (
    <div className={cn("rounded-2xl border p-4 space-y-2", colors[color])} data-section={title}>
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><Icon className="w-4 h-4" /> {title}</p>
      {missing ? <NotProvided text={t.planning.result.notProvided} /> : children}
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon?: any; children: any }) {
  return (
    <p className="text-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </span>
      <span className="block">{children}</span>
    </p>
  );
}

function NotProvided({ text }: { text: string }) {
  return (
    <p className="flex gap-2 items-center text-xs text-gray-400 italic" data-not-provided>
      <Info className="w-3.5 h-3.5" /> {text}
    </p>
  );
}

function Notice({ tone, children }: { tone: "amber"; children: any }) {
  return (
    <div className={cn("flex gap-3 items-start rounded-2xl p-4 text-sm font-medium border", tone === "amber" && "bg-amber-50 border-amber-200 text-amber-900")}>
      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
      <p>{children}</p>
    </div>
  );
}

export type { SectionKey };
