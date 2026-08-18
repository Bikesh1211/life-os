import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/core/api/http";
import { GC_TIME, STALE_TIME } from "./policy";

/**
 * The client cache's default behaviour.
 *
 * The previous defaults turned every revalidation trigger off —
 * `refetchOnMount`, `refetchOnWindowFocus` and `refetchOnReconnect` were all
 * false alongside a five minute `staleTime`. Those settings do different jobs
 * and switching them all off left the cache with no way back to the server:
 * `staleTime` already decides whether a mount causes a request, so with it set,
 * `refetchOnMount: false` does not prevent redundant requests — it prevents
 * *stale* data from ever being refreshed. Data an hour old would keep
 * rendering, silently, until the tab was closed. That is a cache, not
 * stale-while-revalidate.
 *
 * Now the staleness window decides. Inside it a mount is free and instant;
 * past it the cached value still renders instantly and the refresh happens
 * underneath. Reconnecting refreshes, because data fetched before the network
 * dropped is the data most likely to be wrong. Window focus stays off
 * deliberately: LifeOS is a tab people leave open all day, and refetching
 * everything on every alt-tab is the kind of background traffic this work is
 * meant to remove.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME.summary,
        gcTime: GC_TIME,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        /**
         * Only retry what could succeed on a second attempt. The old `retry: 2`
         * re-sent everything, so a 403 cost three round-trips and three times
         * the delay before the user was told, and a validation error looked
         * like a slow network.
         */
        retry: (failureCount, error) => {
          if (error instanceof ApiError) return error.isRetryable && failureCount < 2;
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      },
      mutations: {
        // A mutation is not safe to replay blindly — a retried create is a
        // duplicate record. The caller decides.
        retry: false,
      },
    },
  });
}
