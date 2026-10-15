import type { NutrientSummary } from "./locationService";
import type { CropPlanErrorCode, CropPlanResponse } from "../../shared/cropPlan";

export type SoilParamInput = { value?: number; area?: NutrientSummary };

export class CropPlanRequestError extends Error {
  constructor(public code: CropPlanErrorCode | "NETWORK", message: string, public retryable: boolean) {
    super(message);
  }
}

export async function getCropRecommendation(soilData: {
  region: string;
  season: string;
  location?: { district?: string; subdistrict?: string; village?: string };
  soilContext?: { level: string; areaName: string; cycle: string };
  soil: Record<"n" | "p" | "k" | "ph", SoilParamInput>;
}): Promise<CropPlanResponse> {
  let response: Response;
  try {
    response = await fetch("/api/ai/crop-recommendation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soilData }),
    });
  } catch {
    throw new CropPlanRequestError("NETWORK", "Could not reach the server", true);
  }

  let body: any;
  try {
    body = await response.json();
  } catch {
    throw new CropPlanRequestError("AI_INVALID_RESPONSE", "The server returned an invalid response", true);
  }
  if (!response.ok) {
    throw new CropPlanRequestError(body?.code ?? "AI_ERROR", body?.error || "Failed to get crop recommendation", body?.retryable ?? true);
  }
  if (!Array.isArray(body?.crops) || body.crops.length === 0) {
    throw new CropPlanRequestError("AI_INVALID_RESPONSE", "The server returned no crop recommendations", true);
  }
  return body as CropPlanResponse;
}

export async function analyzePlantDisease(imageContent: string) {
  const response = await fetch("/api/ai/analyze-disease", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageContent }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze plant disease");
  }

  return response.json();
}

export async function getDashboardStats(region: string) {
  const response = await fetch("/api/ai/dashboard-stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ region }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch dashboard stats");
  }

  return response.json();
}
