// Crop-plan API contract shared by server.ts (producer) and CropPlanning.tsx (consumer).
//
// Gemini supplies per-acre agronomic guidance and the economic INPUTS (yield, farm-gate price,
// itemised costs). All money figures are CALCULATED here from those inputs, never taken from
// the model, so per-acre and total figures are always consistent.

export const SECTION_KEYS = [
  "soilSuitability",
  "duration",
  "timeline",
  "water",
  "climate",
  "fertilizer",
  "pests",
  "economics",
  "risks",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export type TimelineStage = { stage: string; startDay: number; endDay: number; activities: string };
export type FertilizerItem = { nutrient: string; product: string; quantityPerAcre: number; unit: string; timing: string };
export type PestRisk = { name: string; type: "pest" | "disease"; prevention: string; treatment: string };
export type CostItem = { item: string; amount: number };

export type CropEconomicsInputs = {
  yieldPerAcreKg: number;
  yieldAssumptions: string;
  pricePerQuintal: number; // INR per 100 kg, farm-gate
  priceBasis: string;
  costPerAcre: CostItem[]; // INR per acre
};

export type CropRecommendation = {
  rank: number;
  cropName: string;
  suitabilityScore: number | null; // 0-100, as judged by the AI
  rationale: string;
  soilSuitability: string | null;
  duration: { minDays: number; maxDays: number; harvestWindow: string } | null;
  timeline: TimelineStage[] | null;
  water: { requirement: string; irrigation: string } | null;
  climate: { temperature: string; sunlight: string } | null;
  fertilizer: { items: FertilizerItem[]; notes: string } | null;
  pests: PestRisk[] | null;
  economics: CropEconomicsInputs | null;
  risks: string[] | null;
  unavailableSections: SectionKey[];
};

export type SoilBasis = Record<"n" | "p" | "k" | "ph", "measured" | "location_estimate" | "unavailable">;

export type CropPlanResponse = {
  status: "complete" | "partial";
  generatedAt: string;
  model: string;
  region: string;
  season: string;
  soilBasis: SoilBasis;
  crops: CropRecommendation[];
  guidanceSource: "ai_generated";
};

export type CropPlanErrorCode =
  | "BAD_REQUEST"
  | "AI_NOT_CONFIGURED"
  | "AI_AUTH"
  | "AI_QUOTA"
  | "AI_MODEL_UNAVAILABLE"
  | "AI_TIMEOUT"
  | "AI_INVALID_RESPONSE"
  | "AI_ERROR";

export type CropPlanError = { error: string; code: CropPlanErrorCode; retryable: boolean; fields?: string[] };

// ---- Finance -----------------------------------------------------------------------------------

export type Finance = { yieldKg: number; investment: number; revenue: number; profit: number; roi: number | null };

export const sumCosts = (items: CostItem[]) => items.reduce((a, c) => a + c.amount, 0);

/** Revenue = yield × price; Profit = revenue − cost; ROI = profit ÷ cost × 100 (cost > 0). */
export function computeFinance(e: Pick<CropEconomicsInputs, "yieldPerAcreKg" | "pricePerQuintal" | "costPerAcre">, acres: number): {
  perAcre: Finance;
  total: Finance;
} {
  const investment = sumCosts(e.costPerAcre);
  const revenue = (e.yieldPerAcreKg / 100) * e.pricePerQuintal;
  const perAcre: Finance = {
    yieldKg: e.yieldPerAcreKg,
    investment,
    revenue,
    profit: revenue - investment,
    roi: investment > 0 ? ((revenue - investment) / investment) * 100 : null,
  };
  const total: Finance = {
    yieldKg: perAcre.yieldKg * acres,
    investment: perAcre.investment * acres,
    revenue: perAcre.revenue * acres,
    profit: perAcre.profit * acres,
    roi: perAcre.roi, // ROI is a ratio; it does not scale with area
  };
  return { perAcre, total };
}

// ---- Validation of the model's JSON ------------------------------------------------------------

const str = (v: unknown, max = 600): string | null => {
  if (typeof v !== "string") return null;
  const s = v.replace(/\s+/g, " ").trim();
  return s ? s.slice(0, max) : null;
};
const num = (v: unknown, min: number, max: number): number | null => {
  const n = typeof v === "string" ? Number(v.replace(/[,₹\s]/g, "")) : v;
  return typeof n === "number" && Number.isFinite(n) && n >= min && n <= max ? n : null;
};
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function parseDuration(v: any): CropRecommendation["duration"] {
  const min = num(v?.minDays, 15, 2000);
  const max = num(v?.maxDays, 15, 2000);
  const harvestWindow = str(v?.harvestWindow, 200);
  if (min === null || max === null || max < min || !harvestWindow) return null;
  return { minDays: Math.round(min), maxDays: Math.round(max), harvestWindow };
}

function parseTimeline(v: unknown): TimelineStage[] | null {
  const stages = arr(v)
    .map((s: any) => {
      const stage = str(s?.stage, 60);
      const startDay = num(s?.startDay, 0, 2000);
      const endDay = num(s?.endDay, 0, 2000);
      const activities = str(s?.activities, 400);
      return stage && startDay !== null && endDay !== null && endDay >= startDay && activities
        ? { stage, startDay: Math.round(startDay), endDay: Math.round(endDay), activities }
        : null;
    })
    .filter((s): s is TimelineStage => s !== null)
    .sort((a, b) => a.startDay - b.startDay);
  return stages.length >= 2 ? stages : null;
}

function parseFertilizer(v: any): CropRecommendation["fertilizer"] {
  const items = arr(v?.items)
    .map((f: any) => {
      const nutrient = str(f?.nutrient, 60);
      const product = str(f?.product, 120);
      const quantityPerAcre = num(f?.quantityPerAcre, 0, 100000);
      const unit = str(f?.unit, 20);
      const timing = str(f?.timing, 200);
      return nutrient && product && quantityPerAcre !== null && unit && timing
        ? { nutrient, product, quantityPerAcre, unit, timing }
        : null;
    })
    .filter((f): f is FertilizerItem => f !== null);
  return items.length ? { items, notes: str(v?.notes, 600) ?? "" } : null;
}

function parsePests(v: unknown): PestRisk[] | null {
  const pests = arr(v)
    .map((p: any) => {
      const name = str(p?.name, 120);
      const type = p?.type === "disease" ? "disease" : p?.type === "pest" ? "pest" : null;
      const prevention = str(p?.prevention, 500);
      const treatment = str(p?.treatment, 500);
      return name && type && prevention && treatment ? { name, type, prevention, treatment } : null;
    })
    .filter((p): p is PestRisk => p !== null);
  return pests.length ? pests : null;
}

function parseEconomics(v: any): CropEconomicsInputs | null {
  const yieldPerAcreKg = num(v?.yieldPerAcreKg, 1, 200000);
  const pricePerQuintal = num(v?.pricePerQuintal, 50, 2000000);
  const yieldAssumptions = str(v?.yieldAssumptions, 500);
  const priceBasis = str(v?.priceBasis, 300);
  const costPerAcre = arr(v?.costPerAcre)
    .map((c: any) => {
      const item = str(c?.item, 80);
      const amount = num(c?.amount, 0, 5000000);
      return item && amount !== null ? { item, amount } : null;
    })
    .filter((c): c is CostItem => c !== null);
  if (yieldPerAcreKg === null || pricePerQuintal === null || !yieldAssumptions || !priceBasis) return null;
  if (!costPerAcre.length || sumCosts(costPerAcre) <= 0) return null;
  return { yieldPerAcreKg, yieldAssumptions, pricePerQuintal, priceBasis, costPerAcre };
}

function parseRisks(v: unknown): string[] | null {
  const risks = arr(v).map((r) => str(r, 400)).filter((r): r is string => !!r);
  return risks.length ? risks : null;
}

/** Validates one crop; returns null if even the essentials (name + rationale) are missing. */
export function parseCrop(raw: any, rank: number): CropRecommendation | null {
  const cropName = str(raw?.cropName, 80);
  const rationale = str(raw?.rationale, 1200);
  if (!cropName || !rationale) return null;
  const sections = {
    soilSuitability: str(raw?.soilSuitability, 800),
    duration: parseDuration(raw?.duration),
    timeline: parseTimeline(raw?.timeline),
    water: (() => {
      const requirement = str(raw?.water?.requirement, 300);
      const irrigation = str(raw?.water?.irrigation, 600);
      return requirement && irrigation ? { requirement, irrigation } : null;
    })(),
    climate: (() => {
      const temperature = str(raw?.climate?.temperature, 200);
      const sunlight = str(raw?.climate?.sunlight, 200);
      return temperature && sunlight ? { temperature, sunlight } : null;
    })(),
    fertilizer: parseFertilizer(raw?.fertilizer),
    pests: parsePests(raw?.pests),
    economics: parseEconomics(raw?.economics),
    risks: parseRisks(raw?.risks),
  };
  const score = num(raw?.suitabilityScore, 0, 100);
  return {
    rank,
    cropName,
    suitabilityScore: score === null ? null : Math.round(score),
    rationale,
    ...sections,
    unavailableSections: SECTION_KEYS.filter((k) => sections[k] === null),
  };
}

/** Validates the model output. Throws if no usable crop is present. */
export function parseCropPlan(raw: unknown): { crops: CropRecommendation[]; complete: boolean } {
  const list = arr((raw as any)?.recommendations);
  const crops = list
    .slice(0, 3)
    .map((c, i) => parseCrop(c, i + 1))
    .filter((c): c is CropRecommendation => c !== null)
    .map((c, i) => ({ ...c, rank: i + 1 }));
  if (!crops.length) throw new Error("AI response contained no usable crop recommendations");
  const complete = crops.length === 3 && crops.every((c) => c.unavailableSections.length === 0);
  return { crops, complete };
}
