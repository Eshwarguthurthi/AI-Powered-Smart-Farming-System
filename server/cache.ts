// Small TTL cache with in-flight de-duplication, so concurrent requests for the
// same key share one upstream call instead of hammering government services.
type Entry<T> = { data: T; expires: number };

const store = new Map<string, Entry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.data as T;

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = load()
    .then((data) => {
      store.set(key, { data, expires: Date.now() + ttlMs });
      return data;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

export class UpstreamError extends Error {
  constructor(public service: string, message: string, public status = 502) {
    super(message);
  }
}

export async function fetchWithTimeout(url: string, init: RequestInit, service: string, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (res.status === 429) throw new UpstreamError(service, `${service} is rate-limiting requests`, 503);
    return res;
  } catch (e: any) {
    if (e instanceof UpstreamError) throw e;
    const reason = e?.name === "AbortError" ? "timed out" : "could not be reached";
    throw new UpstreamError(service, `${service} ${reason}`, 504);
  } finally {
    clearTimeout(timer);
  }
}
