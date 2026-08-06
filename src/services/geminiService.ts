export async function getCropRecommendation(soilData: {
  n: number;
  p: number;
  k: number;
  ph: number;
  season: string;
  region: string;
}) {
  const response = await fetch("/api/ai/crop-recommendation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ soilData }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get crop recommendation");
  }

  return response.json();
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

export async function getMarketPulse(region: string) {
  const response = await fetch("/api/ai/market-pulse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ region }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch market pulse");
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
