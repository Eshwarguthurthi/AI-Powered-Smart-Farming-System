// Client for the backend's LGD location and Soil Health Card endpoints (see server/).
export type Place = { code: number; name: string; nameLocal?: string };

export type NutrientSummary = {
  counts: Record<string, number>;
  total: number;
  dominant: string;
  dominantShare: number;
};

export type SoilLevel = "village" | "block" | "district";

export type SoilLookup =
  | {
      status: "available";
      source: { name: string; url: string };
      dataType: "measured_area_aggregate";
      level: SoilLevel;
      requestedLevel: "village" | "district";
      fallbackReason?: "village_not_found" | "village_insufficient_samples" | "block_insufficient_samples";
      area: { name: string; code: string };
      cycle: string;
      sampleCount: number;
      lastUpdated: string | null;
      cyclesAvailable: { cycle: string; samples: number }[];
      nutrients: Record<"n" | "p" | "k" | "ph", NutrientSummary | null>;
    }
  | {
      status: "unavailable";
      source: { name: string; url: string };
      reason: "state_not_covered" | "district_not_covered" | "no_samples";
    };

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      message = (await response.json()).error || message;
    } catch {
      // non-JSON error body
    }
    throw new Error(message);
  }
  return response.json();
}

export const fetchStates = (signal?: AbortSignal) => getJson<Place[]>("/api/locations/states", signal);
export const fetchDistricts = (stateCode: number, signal?: AbortSignal) =>
  getJson<Place[]>(`/api/locations/districts?stateCode=${stateCode}`, signal);
export const fetchSubdistricts = (districtCode: number, signal?: AbortSignal) =>
  getJson<Place[]>(`/api/locations/subdistricts?districtCode=${districtCode}`, signal);
export const fetchVillages = (subdistrictCode: number, signal?: AbortSignal) =>
  getJson<Place[]>(`/api/locations/villages?subdistrictCode=${subdistrictCode}`, signal);

export function fetchSoil(
  params: { stateCode: number; districtCode: number; villageCode?: number },
  signal?: AbortSignal,
) {
  const q = new URLSearchParams({ stateCode: String(params.stateCode), districtCode: String(params.districtCode) });
  if (params.villageCode) q.set("villageCode", String(params.villageCode));
  return getJson<SoilLookup>(`/api/soil?${q}`, signal);
}
