// Crop recommendation: prompt, Gemini response schema, validation and error classification.
// The response contract lives in shared/cropPlan.ts.
import { Type } from "@google/genai";
import {
  parseCropPlan,
  type CropPlanErrorCode,
  type CropPlanResponse,
  type SoilBasis,
} from "../shared/cropPlan";
import { buildSoilDescription, cleanText } from "./cropInput";

export class AiError extends Error {
  constructor(public code: CropPlanErrorCode, message: string) {
    super(message);
  }
}

const ERROR_INFO: Record<CropPlanErrorCode, { status: number; retryable: boolean; message: string }> = {
  BAD_REQUEST: { status: 400, retryable: false, message: "Invalid request" },
  AI_NOT_CONFIGURED: { status: 503, retryable: false, message: "GEMINI_API_KEY is not configured on the server" },
  AI_AUTH: { status: 502, retryable: false, message: "The Gemini API rejected the server's API key" },
  AI_QUOTA: { status: 503, retryable: true, message: "Gemini quota or rate limit reached" },
  AI_MODEL_UNAVAILABLE: { status: 503, retryable: true, message: "The configured Gemini models are unavailable or overloaded" },
  AI_TIMEOUT: { status: 504, retryable: true, message: "Gemini did not respond in time" },
  AI_INVALID_RESPONSE: { status: 502, retryable: true, message: "Gemini returned an invalid or incomplete response" },
  AI_ERROR: { status: 502, retryable: true, message: "The AI service failed" },
};

export function classifyAiError(e: unknown): CropPlanErrorCode {
  if (e instanceof AiError) return e.code;
  if (e instanceof SyntaxError) return "AI_INVALID_RESPONSE";
  const anyE = e as any;
  const status = Number(anyE?.status ?? anyE?.code ?? anyE?.error?.code);
  const msg = String(anyE?.message ?? anyE?.error?.message ?? e).toLowerCase();
  if (status === 401 || status === 403 || /api key|permission_denied|unregistered callers|unauthenticated/.test(msg)) return "AI_AUTH";
  if (status === 429 || /quota|resource_exhausted|rate limit|exhausted/.test(msg)) return "AI_QUOTA";
  // 503 "high demand" / overloaded: that model is temporarily unavailable; another model may work.
  if (status === 404 || status === 503 || /not_found|not found|is not supported for generatecontent|"unavailable"|high demand|overloaded/.test(msg))
    return "AI_MODEL_UNAVAILABLE";
  if (/timed out|timeout|deadline/.test(msg)) return "AI_TIMEOUT";
  return "AI_ERROR";
}

export function errorBody(code: CropPlanErrorCode, detail?: string) {
  const info = ERROR_INFO[code];
  return { status: info.status, body: { error: detail || info.message, code, retryable: info.retryable } };
}

export const CROP_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      description: "Exactly 3 crops, ranked from most to least suitable",
      items: {
        type: Type.OBJECT,
        properties: {
          cropName: { type: Type.STRING },
          suitabilityScore: { type: Type.NUMBER, description: "0-100 suitability for this location, season and soil" },
          rationale: { type: Type.STRING },
          soilSuitability: { type: Type.STRING, description: "How the given N, P, K and pH information suits this crop" },
          duration: {
            type: Type.OBJECT,
            properties: {
              minDays: { type: Type.NUMBER },
              maxDays: { type: Type.NUMBER },
              harvestWindow: { type: Type.STRING, description: "Approximate harvest months if sown this season" },
            },
            required: ["minDays", "maxDays", "harvestWindow"],
          },
          timeline: {
            type: Type.ARRAY,
            description: "Stages in order: sowing, vegetative growth, flowering/reproductive, maturity, harvest",
            items: {
              type: Type.OBJECT,
              properties: {
                stage: { type: Type.STRING },
                startDay: { type: Type.NUMBER, description: "Days after sowing" },
                endDay: { type: Type.NUMBER, description: "Days after sowing" },
                activities: { type: Type.STRING },
              },
              required: ["stage", "startDay", "endDay", "activities"],
            },
          },
          water: {
            type: Type.OBJECT,
            properties: {
              requirement: { type: Type.STRING, description: "Total water need, e.g. in mm per season" },
              irrigation: { type: Type.STRING, description: "Irrigation schedule and critical stages" },
            },
            required: ["requirement", "irrigation"],
          },
          climate: {
            type: Type.OBJECT,
            properties: { temperature: { type: Type.STRING }, sunlight: { type: Type.STRING } },
            required: ["temperature", "sunlight"],
          },
          fertilizer: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nutrient: { type: Type.STRING, description: "N, P, K, Zn, etc." },
                    product: { type: Type.STRING, description: "e.g. Urea, DAP, MOP" },
                    quantityPerAcre: { type: Type.NUMBER },
                    unit: { type: Type.STRING, description: "kg" },
                    timing: { type: Type.STRING },
                  },
                  required: ["nutrient", "product", "quantityPerAcre", "unit", "timing"],
                },
              },
              notes: { type: Type.STRING },
            },
            required: ["items", "notes"],
          },
          pests: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["pest", "disease"] },
                prevention: { type: Type.STRING },
                treatment: { type: Type.STRING },
              },
              required: ["name", "type", "prevention", "treatment"],
            },
          },
          economics: {
            type: Type.OBJECT,
            properties: {
              yieldPerAcreKg: { type: Type.NUMBER, description: "Expected yield in kg per ONE acre" },
              yieldAssumptions: { type: Type.STRING },
              pricePerQuintal: { type: Type.NUMBER, description: "Expected farm-gate price in INR per quintal (100 kg)" },
              priceBasis: { type: Type.STRING, description: "What the price is based on (e.g. MSP year, typical mandi range); say it is an estimate" },
              costPerAcre: {
                type: Type.ARRAY,
                description: "Cultivation cost items in INR for ONE acre",
                items: {
                  type: Type.OBJECT,
                  properties: { item: { type: Type.STRING }, amount: { type: Type.NUMBER } },
                  required: ["item", "amount"],
                },
              },
            },
            required: ["yieldPerAcreKg", "yieldAssumptions", "pricePerQuintal", "priceBasis", "costPerAcre"],
          },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "cropName", "suitabilityScore", "rationale", "soilSuitability", "duration", "timeline",
          "water", "climate", "fertilizer", "pests", "economics", "risks",
        ],
      },
    },
  },
  required: ["recommendations"],
};

export function soilBasisOf(soilData: any): SoilBasis {
  const basis = (k: string) => {
    const p = soilData?.soil?.[k] ?? {};
    if (p.value !== undefined && p.value !== null && p.value !== "") return "measured" as const;
    if (p.area) return "location_estimate" as const;
    return "unavailable" as const;
  };
  return { n: basis("n"), p: basis("p"), k: basis("k"), ph: basis("ph") };
}

export function buildCropPlanPrompt(soilData: any, soilLines: string[]) {
  const region = cleanText(soilData?.region, 80);
  const season = cleanText(soilData?.season, 20);
  const loc = soilData?.location ?? {};
  const place = [cleanText(loc.village), cleanText(loc.subdistrict), cleanText(loc.district)].filter(Boolean).join(", ");
  return `You are an agronomist advising a smallholder farmer in India. Recommend the 3 most suitable crops, ranked.

Location: ${place ? `${place}, ` : ""}${region}
Season: ${season} (Spring, Summer, Autumn or Winter; map this to the local Kharif/Rabi/Zaid calendar)
Soil information:
  ${soilLines.join("\n  ")}

Rules:
- Crops must be agronomically suitable for this state and season.
- Base fertilizer doses on general recommendations of ICAR / state agricultural universities for this crop and region, adjusted for the soil ratings above. Give quantities of fertilizer PRODUCT in kg per ONE acre with application timing. If soil values are unknown, say the dose assumes average fertility and recommend a soil test.
- Where soil information is an area-level distribution, treat it as typical local soil, not a measurement of this farm, and say so in soilSuitability.
- Economics must be for ONE acre: yield in kg/acre, farm-gate price in INR per quintal, and itemised cultivation costs in INR per acre (seed, fertilizer, plant protection, labour, irrigation, machinery, other). Do not compute totals, profit or ROI.
- You have no live market data: base the price on MSP or typical recent farm-gate ranges and state that it is an estimate in priceBasis.
- Pest and disease risks are general, commonly reported risks for this crop and region, not current outbreaks.
- In risks, include uncertainties (weather, prices, data being area-level) and practical advice.
- Timeline stages use days after sowing.`;
}

export type GenerateJson = (prompt: string, schema: unknown) => Promise<{ data: unknown; model: string }>;

/** Validates input, calls the model, validates its output. Throws AiError on any failure. */
export async function generateCropPlan(soilData: any, generate: GenerateJson): Promise<CropPlanResponse> {
  const { errors, lines } = buildSoilDescription(soilData);
  if (errors.length) throw new AiError("BAD_REQUEST", errors.join("; "));
  const { data, model } = await generate(buildCropPlanPrompt(soilData, lines), CROP_PLAN_SCHEMA);
  let parsed;
  try {
    parsed = parseCropPlan(data);
  } catch (e: any) {
    throw new AiError("AI_INVALID_RESPONSE", e.message);
  }
  return {
    status: parsed.complete ? "complete" : "partial",
    generatedAt: new Date().toISOString(),
    model,
    region: cleanText(soilData?.region, 80),
    season: cleanText(soilData?.season, 20),
    soilBasis: soilBasisOf(soilData),
    crops: parsed.crops,
    guidanceSource: "ai_generated",
  };
}
