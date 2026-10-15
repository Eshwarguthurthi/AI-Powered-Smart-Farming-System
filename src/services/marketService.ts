// Client for /api/market/prices (AGMARKNET via data.gov.in) and the AI market commentary.
export type MandiRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
};

export type MandiProvider = "data_gov_in" | "community_mirror" | "github_archive";
export type MandiSource = { name: string; url: string; official: boolean };
export type FallbackReason = "no_key" | "key_rate_limited" | "key_rejected";

export type MandiPrices =
  | {
      status: "ok";
      provider: MandiProvider;
      source: MandiSource;
      unit: string;
      state: string;
      fetchedAt: string;
      syncedAt: string | null;
      latestArrivalDate: string;
      records: MandiRecord[];
      districts: string[];
      truncated: boolean;
      fallbackReason?: FallbackReason;
    }
  | { status: "no_data"; provider: MandiProvider; source: MandiSource; state: string; fetchedAt: string };

export type PriceHistoryPoint = { date: string; avgModal: number; avgMin: number; avgMax: number; reports: number };

export type MarketErrorCode = "NOT_CONFIGURED" | "RATE_LIMITED" | "KEY_REJECTED" | "UPSTREAM" | "NETWORK";

export class MarketRequestError extends Error {
  constructor(
    public code: MarketErrorCode,
    message: string,
    public keylessStates: string[] = [],
    public reason?: FallbackReason,
    public retryAfterSec?: number,
  ) {
    super(message);
  }
}

export type MarketCommentary = {
  basis: "mandi_data" | "general_guidance";
  summary: string;
  highlights: { commodity: string; note: string }[];
  advice: string[];
  generatedAt: string;
};

export async function getMarketPrices(state: string, signal?: AbortSignal): Promise<MandiPrices> {
  let res: Response;
  try {
    res = await fetch(`/api/market/prices?state=${encodeURIComponent(state)}`, { signal });
  } catch (e: any) {
    if (e?.name === "AbortError") throw e;
    throw new MarketRequestError("NETWORK", "Could not reach the server");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new MarketRequestError(
      body?.code ?? "UPSTREAM",
      body?.error ?? "Failed to load mandi prices",
      body?.keylessStates ?? [],
      body?.reason,
      Number(body?.retryAfterSec) || undefined,
    );
  }
  return body as MandiPrices;
}

export async function getPriceHistory(
  state: string,
  commodity: string,
  to: string,
  provider: MandiProvider,
  signal?: AbortSignal,
): Promise<PriceHistoryPoint[]> {
  const res = await fetch(`/api/market/history?${new URLSearchParams({ state, commodity, to, provider })}`, { signal });
  const body = await res.json().catch(() => null);
  if (!res.ok || !Array.isArray(body?.points)) throw new Error(body?.error ?? "Price history unavailable");
  return body.points as PriceHistoryPoint[];
}

export async function getMarketCommentary(region: string, signal?: AbortSignal): Promise<MarketCommentary> {
  const res = await fetch("/api/ai/market-pulse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ region }),
    signal,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || typeof body?.summary !== "string") throw new Error(body?.error ?? "AI commentary unavailable");
  return body as MarketCommentary;
}
