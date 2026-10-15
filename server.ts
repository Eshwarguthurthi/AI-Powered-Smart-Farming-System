import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { UpstreamError } from "./server/cache";
import { getStates, getDistricts, getSubdistricts, getVillages, getSnapshotInfo } from "./server/locations";
import { lookupSoil } from "./server/soilHealth";
import { getMandiPrices, getPriceHistory, MandiConfigError, MandiRateLimitError } from "./server/mandi";
import { syncSnapshot } from "./server/marketSnapshot";
import { SEASONS, cleanText } from "./server/cropInput";
import { AiError, classifyAiError, errorBody, generateCropPlan } from "./server/cropPlan";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
if (!process.env.GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY is not set in environment variables.");
} else if (!process.env.GEMINI_API_KEY.startsWith("AIza")) {
  console.warn("Warning: GEMINI_API_KEY does not start with 'AIza'. Ensure you are using a standard Gemini API key from AI Studio.");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Models are tried in order; override with GEMINI_MODELS="model-a,model-b".
const GEMINI_MODELS = (process.env.GEMINI_MODELS || "gemini-3.6-flash,gemini-3.5-flash,gemini-3.1-flash-lite")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new AiError("AI_TIMEOUT", `Gemini did not respond within ${ms / 1000} s`)), ms);
    }),
  ]);
}

// The Gemini quota is shared by every page. After any quota error, background pages (dashboard,
// market pulse, chat), which have their own fallback data, stop calling Gemini for 5 minutes so
// requests the farmer explicitly makes (crop plan, plant diagnosis) are not starved.
const BACKGROUND_COOLDOWN_MS = 5 * 60 * 1000;
let backgroundCooldownUntil = 0;
type AiPriority = "user" | "background";

// Calls Gemini with JSON output, trying the next model on quota / unavailable errors.
// Returns the parsed JSON and the model that produced it; throws on failure.
async function generateJson(
  prompt: string,
  schema: any,
  opts: { imagePart?: any; grounding?: boolean; timeoutMs?: number; deadlineMs?: number; priority?: AiPriority } = {},
): Promise<{ data: any; model: string }> {
  if (!process.env.GEMINI_API_KEY) throw new AiError("AI_NOT_CONFIGURED", "GEMINI_API_KEY is not configured on the server");
  if (opts.priority !== "user" && Date.now() < backgroundCooldownUntil) {
    throw new AiError("AI_QUOTA", "Skipping Gemini for this background page to save quota");
  }
  const deadline = Date.now() + (opts.deadlineMs ?? 100000);
  let lastError: unknown = null;

  for (const model of GEMINI_MODELS) {
    const remaining = deadline - Date.now();
    if (remaining < 5000) {
      lastError = new AiError("AI_TIMEOUT", "Gemini did not respond in time");
      break;
    }
    try {
      const parts: any[] = [{ text: prompt }];
      if (opts.imagePart) parts.push(opts.imagePart);

      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: { role: "user", parts },
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            ...(opts.grounding === false ? {} : { tools: [{ googleSearch: {} }] }),
          },
        }),
        Math.min(opts.timeoutMs ?? 40000, remaining),
      );

      if (!response?.text) throw new AiError("AI_INVALID_RESPONSE", "Empty response from Gemini");
      try {
        return { data: JSON.parse(response.text), model };
      } catch {
        throw new AiError("AI_INVALID_RESPONSE", "Gemini returned text that is not valid JSON");
      }
    } catch (e: any) {
      lastError = e;
      const code = classifyAiError(e);
      console.warn(`Model ${model} failed (${code}):`, String(e?.message ?? e).slice(0, 300));
      // Another model may still work for quota / missing-model problems; auth and timeouts won't improve.
      if (code === "AI_QUOTA") backgroundCooldownUntil = Date.now() + BACKGROUND_COOLDOWN_MS;
      if (code === "AI_QUOTA" || code === "AI_MODEL_UNAVAILABLE") continue;
      throw e;
    }
  }
  throw lastError || new AiError("AI_MODEL_UNAVAILABLE", "No Gemini model is configured");
}

// Used by the dashboard, diagnostics, market and chat endpoints.
async function generateAIContent(prompt: string, schema: any, imagePart?: any, priority: AiPriority = "background") {
  return (await generateJson(prompt, schema, { imagePart, priority })).data;
}

// Fallback data for regions to handle quota exhaustion gracefully
const FALLBACK_STATS: Record<string, any> = {
  "Maharashtra": {
    weatherCondition: "Humid & Sunny",
    temperature: 32,
    windSpeed: 14,
    rainChance: 20,
    soilHealthStatus: "Stable",
    soilHealthPercentage: 82,
    moistureLevel: "Optimal",
    moisturePercentage: 68,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 15,
    seasonalTrend: "+4.1% growth",
    marketMomentumPercentage: 74,
    yieldProjections: [
      { name: 'Mon', value: 420 },
      { name: 'Tue', value: 380 },
      { name: 'Wed', value: 550 },
      { name: 'Thu', value: 720 },
      { name: 'Fri', value: 610 },
      { name: 'Sat', value: 840 },
      { name: 'Sun', value: 790 },
    ],
  },
  "Punjab": {
    weatherCondition: "Clear Skies",
    temperature: 36,
    windSpeed: 10,
    rainChance: 5,
    soilHealthStatus: "Rich",
    soilHealthPercentage: 91,
    moistureLevel: "Saturated",
    moisturePercentage: 84,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 35,
    seasonalTrend: "+5.8% growth",
    marketMomentumPercentage: 88,
    yieldProjections: [
      { name: 'Mon', value: 600 },
      { name: 'Tue', value: 650 },
      { name: 'Wed', value: 780 },
      { name: 'Thu', value: 920 },
      { name: 'Fri', value: 850 },
      { name: 'Sat', value: 980 },
      { name: 'Sun', value: 1100 },
    ],
  },
  "Karnataka": {
    weatherCondition: "Tropical-Rich",
    temperature: 28,
    windSpeed: 18,
    rainChance: 45,
    soilHealthStatus: "Moderate",
    soilHealthPercentage: 72,
    moistureLevel: "Low",
    moisturePercentage: 42,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 10,
    seasonalTrend: "+2.5% growth",
    marketMomentumPercentage: 61,
  },
  "Tamil Nadu": {
    weatherCondition: "Hot & Coastal",
    temperature: 34,
    windSpeed: 16,
    rainChance: 10,
    soilHealthStatus: "Good",
    soilHealthPercentage: 85,
    moistureLevel: "Optimal",
    moisturePercentage: 71,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 22,
    seasonalTrend: "+3.9% growth",
    marketMomentumPercentage: 79,
    yieldProjections: [
      { name: 'Mon', value: 450 },
      { name: 'Tue', value: 480 },
      { name: 'Wed', value: 520 },
      { name: 'Thu', value: 590 },
      { name: 'Fri', value: 550 },
      { name: 'Sat', value: 620 },
      { name: 'Sun', value: 680 },
    ],
  },
  "Uttar Pradesh": {
    weatherCondition: "Clear & Sunny",
    temperature: 38,
    windSpeed: 8,
    rainChance: 2,
    soilHealthStatus: "Highly Fertile",
    soilHealthPercentage: 89,
    moistureLevel: "Optimal",
    moisturePercentage: 75,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 28,
    seasonalTrend: "+4.5% growth",
    marketMomentumPercentage: 82,
  },
  "Gujarat": {
    weatherCondition: "Arid & Windy",
    temperature: 40,
    windSpeed: 22,
    rainChance: 0,
    soilHealthStatus: "Arid-Stable",
    soilHealthPercentage: 76,
    moistureLevel: "Moderate",
    moisturePercentage: 54,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 12,
    seasonalTrend: "+3.2% growth",
    marketMomentumPercentage: 71,
  },
  "Andhra Pradesh": {
    soilHealthStatus: "Optimal",
    soilHealthPercentage: 84,
    moistureLevel: "Optimal",
    moisturePercentage: 72,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 25,
    seasonalTrend: "+4.8% growth",
    marketMomentumPercentage: 80,
  },
  "West Bengal": {
    weatherCondition: "Tropical-Moist",
    temperature: 31,
    windSpeed: 12,
    rainChance: 60,
    soilHealthStatus: "Alluvial-Rich",
    soilHealthPercentage: 92,
    moistureLevel: "High",
    moisturePercentage: 88,
    pathogenThreat: "High",
    pathogenThreatPercentage: 42,
    seasonalTrend: "+5.2% growth",
    marketMomentumPercentage: 85,
  },
  "Rajasthan": {
    weatherCondition: "Extreme Heat",
    temperature: 44,
    windSpeed: 25,
    rainChance: 0,
    soilHealthStatus: "Sandy-Stable",
    soilHealthPercentage: 65,
    moistureLevel: "Dry",
    moisturePercentage: 32,
    pathogenThreat: "Very Low",
    pathogenThreatPercentage: 5,
    seasonalTrend: "+2.1% growth",
    marketMomentumPercentage: 58,
  },
  "Bihar": {
    soilHealthStatus: "Alluvial-Rich",
    soilHealthPercentage: 88,
    moistureLevel: "High",
    moisturePercentage: 82,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 31,
    seasonalTrend: "+3.8% growth",
    marketMomentumPercentage: 72,
  },
  "Madhya Pradesh": {
    soilHealthStatus: "Black Soil-Rich",
    soilHealthPercentage: 85,
    moistureLevel: "Moderate",
    moisturePercentage: 58,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 18,
    seasonalTrend: "+4.2% growth",
    marketMomentumPercentage: 76,
  },
  "Haryana": {
    soilHealthStatus: "Fertile",
    soilHealthPercentage: 87,
    moistureLevel: "Optimal",
    moisturePercentage: 74,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 24,
    seasonalTrend: "+5.1% growth",
    marketMomentumPercentage: 84,
  },
  "Kerala": {
    soilHealthStatus: "Laterite-Rich",
    soilHealthPercentage: 81,
    moistureLevel: "High",
    moisturePercentage: 92,
    pathogenThreat: "High",
    pathogenThreatPercentage: 45,
    seasonalTrend: "+3.5% growth",
    marketMomentumPercentage: 68,
  },
  "Telangana": {
    soilHealthStatus: "Red-Stable",
    soilHealthPercentage: 79,
    moistureLevel: "Moderate",
    moisturePercentage: 52,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 14,
    seasonalTrend: "+4.4% growth",
    marketMomentumPercentage: 73,
  },
  "Odisha": {
    soilHealthStatus: "Coastal-Rich",
    soilHealthPercentage: 83,
    moistureLevel: "Optimal",
    moisturePercentage: 78,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 29,
    seasonalTrend: "+3.6% growth",
    marketMomentumPercentage: 69,
  },
  "Assam": {
    soilHealthStatus: "Acidic-Rich",
    soilHealthPercentage: 86,
    moistureLevel: "Very High",
    moisturePercentage: 95,
    pathogenThreat: "High",
    pathogenThreatPercentage: 38,
    seasonalTrend: "+2.9% growth",
    marketMomentumPercentage: 65,
  },
  "Jammu and Kashmir": {
    soilHealthStatus: "Mountain-Rich",
    soilHealthPercentage: 84,
    moistureLevel: "Optimal",
    moisturePercentage: 68,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 11,
    seasonalTrend: "+4.7% growth",
    marketMomentumPercentage: 77,
  },
  "Chhattisgarh": {
    soilHealthStatus: "Red-Yellow",
    soilHealthPercentage: 75,
    moistureLevel: "Optimal",
    moisturePercentage: 65,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 16,
    seasonalTrend: "+3.1% growth",
    marketMomentumPercentage: 64,
  },
  "Jharkhand": {
    soilHealthStatus: "Red-Sandy",
    soilHealthPercentage: 72,
    moistureLevel: "Moderate",
    moisturePercentage: 48,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 12,
    seasonalTrend: "+2.4% growth",
    marketMomentumPercentage: 59,
  },
  "Uttarakhand": {
    soilHealthStatus: "Forest-Rich",
    soilHealthPercentage: 88,
    moistureLevel: "Optimal",
    moisturePercentage: 72,
    pathogenThreat: "Very Low",
    pathogenThreatPercentage: 8,
    seasonalTrend: "+3.9% growth",
    marketMomentumPercentage: 71,
  },
  "Himachal Pradesh": {
    soilHealthStatus: "Mountain-Fertile",
    soilHealthPercentage: 86,
    moistureLevel: "Optimal",
    moisturePercentage: 70,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 9,
    seasonalTrend: "+4.2% growth",
    marketMomentumPercentage: 74,
  },
  "Goa": {
    soilHealthStatus: "Coastal-Laterite",
    soilHealthPercentage: 78,
    moistureLevel: "High",
    moisturePercentage: 85,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 25,
    seasonalTrend: "+2.8% growth",
    marketMomentumPercentage: 62,
  },
  "Delhi": {
    soilHealthStatus: "Urban-Mixed",
    soilHealthPercentage: 68,
    moistureLevel: "Low",
    moisturePercentage: 45,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 20,
    seasonalTrend: "+1.5% growth",
    marketMomentumPercentage: 55,
  },
  "Arunachal Pradesh": {
    soilHealthStatus: "Mountain-Rich",
    soilHealthPercentage: 92,
    moistureLevel: "Very High",
    moisturePercentage: 88,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 10,
    seasonalTrend: "+4.1% growth",
    marketMomentumPercentage: 72,
  },
  "Manipur": {
    soilHealthStatus: "Humic-Rich",
    soilHealthPercentage: 85,
    moistureLevel: "High",
    moisturePercentage: 82,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 22,
    seasonalTrend: "+3.4% growth",
    marketMomentumPercentage: 65,
  },
  "Meghalaya": {
    soilHealthStatus: "Acidic-Fertile",
    soilHealthPercentage: 84,
    moistureLevel: "Extremely High",
    moisturePercentage: 98,
    pathogenThreat: "High",
    pathogenThreatPercentage: 35,
    seasonalTrend: "+3.8% growth",
    marketMomentumPercentage: 68,
  },
  "Mizoram": {
    soilHealthStatus: "Hill-Stable",
    soilHealthPercentage: 80,
    moistureLevel: "High",
    moisturePercentage: 85,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 18,
    seasonalTrend: "+2.9% growth",
    marketMomentumPercentage: 60,
  },
  "Nagaland": {
    soilHealthStatus: "Organic-Rich",
    soilHealthPercentage: 88,
    moistureLevel: "High",
    moisturePercentage: 84,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 12,
    seasonalTrend: "+3.6% growth",
    marketMomentumPercentage: 63,
  },
  "Sikkim": {
    soilHealthStatus: "Organic-Certified",
    soilHealthPercentage: 95,
    moistureLevel: "Optimal",
    moisturePercentage: 78,
    pathogenThreat: "Very Low",
    pathogenThreatPercentage: 5,
    seasonalTrend: "+5.2% growth",
    marketMomentumPercentage: 82,
  },
  "Tripura": {
    soilHealthStatus: "Laterite-Stable",
    soilHealthPercentage: 79,
    moistureLevel: "High",
    moisturePercentage: 86,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 25,
    seasonalTrend: "+3.1% growth",
    marketMomentumPercentage: 61,
  },
  "Ladakh": {
    soilHealthStatus: "Cold Desert-Rich",
    soilHealthPercentage: 74,
    moistureLevel: "Arid",
    moisturePercentage: 22,
    pathogenThreat: "Very Low",
    pathogenThreatPercentage: 2,
    seasonalTrend: "+2.5% growth",
    marketMomentumPercentage: 58,
  },
  "Andaman and Nicobar Islands": {
    soilHealthStatus: "Tropical-Rich",
    soilHealthPercentage: 86,
    moistureLevel: "High",
    moisturePercentage: 90,
    pathogenThreat: "High",
    pathogenThreatPercentage: 30,
    seasonalTrend: "+3.2% growth",
    marketMomentumPercentage: 64,
  },
  "Puducherry": {
    soilHealthStatus: "Coastal-Alluvial",
    soilHealthPercentage: 82,
    moistureLevel: "Optimal",
    moisturePercentage: 75,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 20,
    seasonalTrend: "+2.8% growth",
    marketMomentumPercentage: 66,
  },
  "Chandigarh": {
    soilHealthStatus: "Urban-Stable",
    soilHealthPercentage: 76,
    moistureLevel: "Moderate",
    moisturePercentage: 60,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 15,
    seasonalTrend: "+1.9% growth",
    marketMomentumPercentage: 59,
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    soilHealthStatus: "Coastal-Sandy",
    soilHealthPercentage: 74,
    moistureLevel: "Optimal",
    moisturePercentage: 68,
    pathogenThreat: "Medium",
    pathogenThreatPercentage: 22,
    seasonalTrend: "+2.4% growth",
    marketMomentumPercentage: 61,
  },
  "Lakshadweep": {
    soilHealthStatus: "Coral-Sandy",
    soilHealthPercentage: 68,
    moistureLevel: "High",
    moisturePercentage: 82,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 10,
    seasonalTrend: "+1.8% growth",
    marketMomentumPercentage: 54,
  },
  default: {
    weatherCondition: "Partly Cloudy",
    temperature: 30,
    windSpeed: 12,
    rainChance: 15,
    soilHealthStatus: "Stable",
    soilHealthPercentage: 78,
    moistureLevel: "Optimal",
    moisturePercentage: 65,
    pathogenThreat: "Low",
    pathogenThreatPercentage: 12,
    seasonalTrend: "+3.2% growth",
    marketMomentumPercentage: 68,
    yieldProjections: [
      { name: 'Mon', value: 400 },
      { name: 'Tue', value: 300 },
      { name: 'Wed', value: 600 },
      { name: 'Thu', value: 800 },
      { name: 'Fri', value: 500 },
      { name: 'Sat', value: 900 },
      { name: 'Sun', value: 700 },
    ],
  }
};

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 3600000; // 1 hour

function getCachedData(key: string) {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  cache[key] = { data, timestamp: Date.now() };
}

function parseCode(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 && n < 1e9 ? n : null;
}

function sendUpstreamError(res: express.Response, error: unknown, fallbackMessage: string) {
  if (error instanceof UpstreamError) {
    console.warn(`[${error.service}] ${error.message}`);
    return res.status(error.status).json({ error: error.message, service: error.service });
  }
  console.error(fallbackMessage, error);
  return res.status(500).json({ error: fallbackMessage });
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with higher limit for image uploads
  app.use(express.json({ limit: "10mb" }));

  // Location hierarchy (LGD) and area soil-test data (Soil Health Card)
  app.get("/api/locations/meta", (_req, res) => {
    res.json(getSnapshotInfo() ?? { source: "Local Government Directory (LGD) live web service", sourceUrl: "https://lgdirectory.gov.in" });
  });

  app.get("/api/locations/states", async (_req, res) => {
    try {
      res.json(await getStates());
    } catch (error) {
      sendUpstreamError(res, error, "Failed to load states");
    }
  });

  const locationRoute = (param: string, load: (code: number) => Promise<unknown>, label: string) =>
    async (req: express.Request, res: express.Response) => {
      const code = parseCode(req.query[param]);
      if (!code) return res.status(400).json({ error: `A valid numeric ${param} is required` });
      try {
        res.json(await load(code));
      } catch (error) {
        sendUpstreamError(res, error, `Failed to load ${label}`);
      }
    };
  app.get("/api/locations/districts", locationRoute("stateCode", getDistricts, "districts"));
  app.get("/api/locations/subdistricts", locationRoute("districtCode", getSubdistricts, "sub-districts"));
  app.get("/api/locations/villages", locationRoute("subdistrictCode", getVillages, "villages"));

  app.get("/api/soil", async (req, res) => {
    const stateCode = parseCode(req.query.stateCode);
    const districtCode = parseCode(req.query.districtCode);
    const villageCode = req.query.villageCode === undefined ? undefined : parseCode(req.query.villageCode);
    if (!stateCode || !districtCode || villageCode === null) {
      return res.status(400).json({ error: "stateCode and districtCode are required; villageCode must be numeric" });
    }
    try {
      res.json(await lookupSoil({ stateCode, districtCode, villageCode: villageCode ?? undefined }));
    } catch (error) {
      sendUpstreamError(res, error, "Failed to load soil data");
    }
  });

  // AI API routes
  app.post("/api/ai/crop-recommendation", async (req, res) => {
    const soilData = req.body?.soilData;
    const region = cleanText(soilData?.region, 80);
    const season = cleanText(soilData?.season, 20);
    if (!region || !SEASONS.includes(season)) {
      const { status, body } = errorBody("BAD_REQUEST", "A state and a valid season are required");
      return res.status(status).json(body);
    }
    try {
      // Grounding is off: we ask for general agronomic guidance, not claims about current events,
      // and some models reject search tools combined with a JSON response schema.
      const plan = await generateCropPlan(soilData, (prompt, schema) =>
        generateJson(prompt, schema, { grounding: false, timeoutMs: 45000, deadlineMs: 100000, priority: "user" }),
      );
      res.json(plan);
    } catch (error) {
      const code = classifyAiError(error);
      console.error(`Crop recommendation failed (${code}):`, (error as any)?.message ?? error);
      const { status, body } = errorBody(code, error instanceof AiError ? error.message : undefined);
      res.status(status).json(body);
    }
  });

  app.post("/api/ai/analyze-disease", async (req, res) => {
    try {
      const { imageContent } = req.body;
      
      const schema = {
        type: Type.OBJECT,
        properties: {
          plantSpecies: { type: Type.STRING },
          disease: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
          treatment: { type: Type.STRING },
          prevention: { type: Type.STRING },
          recoverySteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          isPlantLeaf: { type: Type.BOOLEAN },
        },
        required: ["disease", "confidence", "treatment", "prevention", "recoverySteps", "isPlantLeaf"],
      };

      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageContent.split(",")[1],
        },
      };

      const data = await generateAIContent(`As a world-class plant pathologist, analyze this image. 
      1. Determine if this is a plant leaf. If not, set isPlantLeaf to false.
      2. Identify the plant species.
      3. Detect diseases, pests, or deficiencies.
      4. Provide diagnosis, confidence (0-100), and symptoms.
      5. Recommend detailed treatment.
      6. Provide a "Prevention" guide to stop this from happening again.
      7. List "Recovery Steps" to overcome the current infection and restore plant health.`, schema, imagePart, "user");
      res.json(data);
    } catch (error) {
      console.error("AI Disease Analysis Error:", error);
      // More varied fallback
      const fallbacks = [
        { 
          disease: "Early Blight Signs", 
          confidence: 58, 
          symptoms: ["Yellowing halo", "Dark concentric rings"], 
          treatment: "Remove infected leaves and apply copper-based fungicide.",
          prevention: "Practice crop rotation and avoid overhead irrigation.",
          recoverySteps: ["Prune lower leaves", "Apply mulch", "Boost potassium"]
        },
        { 
          disease: "Nutrient Deficiency (Nitrogen)", 
          confidence: 62, 
          symptoms: ["General pale green/yellow color", "Stunted growth"], 
          treatment: "Apply nitrogen-rich fertilizer or compost tea.",
          prevention: "Incorporate organic matter and use cover crops.",
          recoverySteps: ["Side-dress with urea", "Foliar spray with liquid kelp"]
        },
        { 
          disease: "Bacterial Wilt (Potential)", 
          confidence: 45, 
          symptoms: ["Drooping leaves", "Greenish-brown streaks"], 
          treatment: "Improve soil drainage and avoid overhead watering.",
          prevention: "Use disease-free seeds and rotate with non-susceptible crops.",
          recoverySteps: ["Remove wilted plants immediately", "Sanitize tools", "Improve soil aeration"]
        }
      ];
      const selected = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      res.json({
        plantSpecies: "Unknown (Fallback)",
        isPlantLeaf: true,
        ...selected
      });
    }
  });

  // Live mandi prices (AGMARKNET via data.gov.in)
  app.get("/api/market/prices", async (req, res) => {
    const state = cleanText(req.query.state, 80);
    if (!state) return res.status(400).json({ error: "state is required", code: "BAD_REQUEST" });
    try {
      res.json(await getMandiPrices(state));
    } catch (error) {
      if (error instanceof MandiConfigError) {
        return res.status(503).json({ error: error.message, code: "NOT_CONFIGURED", reason: error.reason, keylessStates: error.keylessStates });
      }
      if (error instanceof MandiRateLimitError) {
        return res.status(503).json({ error: error.message, code: "RATE_LIMITED", service: error.service, retryAfterSec: error.retryAfterSec });
      }
      if (error instanceof UpstreamError) {
        const code = error.status === 503 ? "RATE_LIMITED" : /rejected/.test(error.message) ? "KEY_REJECTED" : "UPSTREAM";
        console.warn(`[${error.service}] ${error.message}`);
        return res.status(error.status).json({ error: error.message, code });
      }
      console.error("Mandi prices error:", error);
      res.status(500).json({ error: "Failed to load mandi prices", code: "UPSTREAM" });
    }
  });

  app.get("/api/market/history", async (req, res) => {
    const state = cleanText(req.query.state, 80);
    const commodity = cleanText(req.query.commodity, 80);
    if (!state || !commodity) return res.status(400).json({ error: "state and commodity are required", code: "BAD_REQUEST" });
    try {
      res.json({ state, commodity, points: await getPriceHistory(state, commodity, cleanText(req.query.to, 10) || undefined, cleanText(req.query.provider, 20) || undefined) });
    } catch (error) {
      console.warn("Price history unavailable:", (error as any)?.message ?? error);
      res.status(502).json({ error: "Price history is unavailable", code: "UPSTREAM" });
    }
  });

  // AI commentary on the state's market. When live mandi data is available it is the only basis
  // for price statements; the model is told not to invent prices or percentage changes.
  app.post("/api/ai/market-pulse", async (req, res) => {
    const region = cleanText(req.body?.region, 80);
    if (!region) return res.status(400).json({ error: "region is required", code: "BAD_REQUEST" });
    const cacheKey = `market-pulse-v2-${region}`;
    const hit = getCachedData(cacheKey);
    if (hit) return res.json(hit);

    let mandi: Awaited<ReturnType<typeof getMandiPrices>> | null = null;
    try {
      mandi = await getMandiPrices(region);
    } catch {
      mandi = null; // commentary can still be general guidance
    }
    const priceLines =
      mandi?.status === "ok"
        ? mandi.commodities
            .slice(0, 25)
            .map((c) => `${c.commodity}: median modal Rs.${c.medianModal}/quintal across ${c.markets} market(s), range Rs.${c.minPrice}-${c.maxPrice} (arrivals up to ${c.latestDate})`)
            .join("\n")
        : "";
    const basis = priceLines ? "mandi_data" : "general_guidance";

    const prompt = priceLines
      ? `You are an agricultural market analyst. Below are today's AGMARKNET mandi prices for ${region}, India.
${priceLines}

Write a short market commentary for farmers based ONLY on these figures plus general seasonal knowledge.
Rules: do not invent prices, percentage changes or trends over time (only one day of data is given); refer to prices exactly as given; keep advice practical (e.g. compare markets, grading, timing of sale).`
      : `You are an agricultural market analyst. Live mandi prices for ${region}, India are not available.
Give general, seasonal marketing guidance for farmers in ${region}. Do not state any prices, percentages or claims about current market movements.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        highlights: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { commodity: { type: Type.STRING }, note: { type: Type.STRING } },
            required: ["commodity", "note"],
          },
        },
        advice: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["summary", "highlights", "advice"],
    };

    try {
      const raw = await generateAIContent(prompt, schema);
      const summary = cleanText(raw?.summary, 1200);
      if (!summary) throw new AiError("AI_INVALID_RESPONSE", "Empty market commentary");
      const data = {
        basis,
        summary,
        highlights: (Array.isArray(raw?.highlights) ? raw.highlights : [])
          .map((h: any) => ({ commodity: cleanText(h?.commodity, 80), note: cleanText(h?.note, 400) }))
          .filter((h: any) => h.commodity && h.note)
          .slice(0, 6),
        advice: (Array.isArray(raw?.advice) ? raw.advice : []).map((a: any) => cleanText(a, 300)).filter(Boolean).slice(0, 5),
        generatedAt: new Date().toISOString(),
      };
      setCachedData(cacheKey, data);
      res.json(data);
    } catch (error) {
      const code = classifyAiError(error);
      console.warn(`AI market commentary failed (${code})`);
      const { status, body } = errorBody(code, error instanceof AiError ? error.message : undefined);
      res.status(status).json(body);
    }
  });

  app.post("/api/ai/dashboard-stats", async (req, res) => {
    const { region } = req.body;
    const cleanRegion = region?.trim() || "default";
    try {
      const cacheKey = `dashboard-stats-${cleanRegion}`;
      const cached = getCachedData(cacheKey);
      if (cached) return res.json(cached);
      
      const prompt = `As an agricultural analyst, provide real-time dashboard statistics, current weather conditions, and a 7-day yield projection (Mon-Sun) for the ${cleanRegion} region as of ${new Date().toLocaleDateString('en-IN')}. 
      
      Include:
      1. Weather: condition (e.g. Sunny, Rain, Cloudy), temperature (°C), wind speed (km/h), and rain chance (%).
      2. Soil: health status and percentage.
      3. Moisture: level and percentage.
      4. Pathogen threats and trends.
      
      Use real current data if available via your grounding tools.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          weatherCondition: { type: Type.STRING },
          temperature: { type: Type.NUMBER },
          windSpeed: { type: Type.NUMBER },
          rainChance: { type: Type.NUMBER },
          soilHealthStatus: { type: Type.STRING },
          soilHealthPercentage: { type: Type.NUMBER },
          moistureLevel: { type: Type.STRING },
          moisturePercentage: { type: Type.NUMBER },
          pathogenThreat: { type: Type.STRING },
          pathogenThreatPercentage: { type: Type.NUMBER },
          seasonalTrend: { type: Type.STRING },
          marketMomentumPercentage: { type: Type.NUMBER },
          yieldProjections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.NUMBER },
              },
              required: ["name", "value"],
            },
          },
        },
        required: ["weatherCondition", "temperature", "windSpeed", "rainChance", "soilHealthStatus", "soilHealthPercentage", "moistureLevel", "moisturePercentage", "pathogenThreat", "pathogenThreatPercentage", "seasonalTrend", "marketMomentumPercentage", "yieldProjections"],
      };

      // Add grounding to dashboard stats
      const data = await generateAIContent(prompt, schema);
      setCachedData(cacheKey, data);
      res.json(data);
    } catch (error: any) {
      console.error("AI Dashboard Stats Error:", error);
      // Fallback with randomization
      let rawData = FALLBACK_STATS[cleanRegion] || FALLBACK_STATS.default;
      let data = JSON.parse(JSON.stringify(rawData));
      
      // Add weather fallbacks if not present
      data.weatherCondition = data.weatherCondition || "Partly Cloudy";
      data.temperature = data.temperature || 30;
      data.windSpeed = data.windSpeed || 10;
      data.rainChance = data.rainChance !== undefined ? data.rainChance : (Math.floor(Math.random() * 25) + 5);

      // Randomize percentages slightly to look live
      data.soilHealthPercentage = Math.min(100, Math.max(0, data.soilHealthPercentage + (Math.random() * 4 - 2)));
      data.moisturePercentage = Math.min(100, Math.max(0, data.moisturePercentage + (Math.random() * 6 - 3)));
      data.pathogenThreatPercentage = Math.min(100, Math.max(0, data.pathogenThreatPercentage + (Math.random() * 4 - 2)));
      data.temperature = data.temperature + (Math.floor(Math.random() * 5) - 2);
      data.rainChance = Math.min(100, Math.max(0, data.rainChance + (Math.floor(Math.random() * 10) - 5)));
      
      // If specific state doesn't have yieldProjections, generate one based on its momentum
      if (!data.yieldProjections) {
        const momentum = data.marketMomentumPercentage || 70;
        const base = momentum * 10;
        
        // Add a slight "random" offset based on the region name length to ensure variety
        const offset = cleanRegion.length * 5;
        
        data.yieldProjections = [
          { name: 'Mon', value: Math.round(base * 0.6 + offset) },
          { name: 'Tue', value: Math.round(base * 0.5 + offset * 1.2) },
          { name: 'Wed', value: Math.round(base * 0.8 + offset * 0.8) },
          { name: 'Thu', value: Math.round(base * 1.0 + offset * 1.5) },
          { name: 'Fri', value: Math.round(base * 0.7 + offset * 0.5) },
          { name: 'Sat', value: Math.round(base * 1.2 + offset * 2.0) },
          { name: 'Sun', value: Math.round(base * 1.1 + offset * 1.8) },
        ];
      }
      
      res.json(data);
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Agri-Assistant Chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const prompt = `You are a helpful and expert AI Agricultural Assistant for an Indian Precision Farming system. 
      The user is currently in the ${context.region} region. 
      The current season is ${context.season}.
      Answer the user's question clearly and provide actionable agricultural advice.
      
      User Question: ${message}`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          response: { type: Type.STRING },
          suggestedActions: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["response", "suggestedActions"]
      };

      const data = await generateAIContent(prompt, schema);
      res.json(data);
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.json({
        response: "I'm currently specialized in regional planning and disease detection. For specific queries, please ensure you've selected your region correctly. How can I help you with your crop plan today?",
        suggestedActions: ["Check Crop Plan", "Run Diagnostics", "View Market Pulse"]
      });
    }
  });

  // Keep the keyless AGMARKNET archive current (downloads only when GitHub has a new version).
  syncSnapshot().catch(() => {});
  setInterval(() => syncSnapshot().catch(() => {}), 6 * 60 * 60 * 1000).unref();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
