/**
 * The single way client code talks to the LifeOS API.
 *
 * Every hook used to inline its own `fetch` and throw
 * `new Error("Failed to fetch X")`. That discarded the status code, which is
 * the one thing a caller needs in order to decide anything: a 500 is worth
 * retrying, a 403 never is, and a 401 means the session is gone rather than
 * that the request was malformed. It also meant no request had a timeout — a
 * connection that hangs hangs until the browser gives up, with the UI stuck on
 * a spinner — and none passed an abort signal, so a query the user navigated
 * away from kept running and still resolved into the cache.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /**
   * Whether retrying could plausibly produce a different answer. A rejected
   * request is rejected however many times it is sent; only server faults,
   * rate limits and transport failures are worth another attempt.
   */
  get isRetryable(): boolean {
    return this.status === 0 || this.status === 429 || this.status >= 500;
  }
}

/** No API call should outlive this. Long enough for a cold serverless start. */
const DEFAULT_TIMEOUT_MS = 15_000;

export type ApiFetchOptions = Omit<RequestInit, "signal"> & {
  /** Caller's signal — React Query supplies one that fires on unmount. */
  signal?: AbortSignal | null;
  timeoutMs?: number;
};

/**
 * Fetches JSON from the API, or throws `ApiError`.
 *
 * The caller's signal and the timeout are combined, so whichever fires first
 * aborts the request: React Query cancels on unmount and on key change, and
 * the timeout covers a server that accepted the connection and then went
 * quiet.
 */
export async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const { signal, timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...rest } = options;

  const timeout = AbortSignal.timeout(timeoutMs);
  const composed = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers:
        rest.body && !(rest.body instanceof FormData)
          ? { "Content-Type": "application/json", ...headers }
          : headers,
      signal: composed,
    });
  } catch (error) {
    // An abort the caller asked for is not a failure — let React Query see it
    // as the cancellation it is instead of turning it into a retryable error.
    if (signal?.aborted) throw error;
    if (timeout.aborted) throw new ApiError(`Request to ${url} timed out`, 0);
    throw new ApiError(error instanceof Error ? error.message : "Network request failed", 0);
  }

  if (!response.ok) {
    throw new ApiError(
      `Request to ${url} failed with ${response.status}`,
      response.status,
      await response.json().catch(() => undefined),
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Builds a query string, dropping empties so keys stay stable and cacheable. */
export function toSearchParams(
  params: Record<string, string | number | boolean | string[] | null | undefined> = {},
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
