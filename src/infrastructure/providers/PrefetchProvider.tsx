"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { apiFetch } from "@/core/api/http";
import { STALE_TIME } from "@/infrastructure/cache/policy";

const PREFETCH_CONFIGS = [
  { key: ["gamification", "profile"], url: "/api/gamification/profile" },
  { key: ["timeline", "today"], url: "/api/timeline?today=true&limit=5" },
] as const;

export function PrefetchProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const prefetched = useRef(false);

  useEffect(() => {
    if (prefetched.current) return;
    prefetched.current = true;

    for (const { key, url } of PREFETCH_CONFIGS) {
      void queryClient.prefetchQuery({
        queryKey: key,
        // `apiFetch` adds the request timeout and surfaces non-2xx as a typed
        // error, so a failing prefetch is dropped quietly instead of leaving a
        // half-formed cache entry behind.
        queryFn: () => apiFetch<unknown>(url),
        staleTime: STALE_TIME.summary,
        retry: false,
      });
    }
  }, [queryClient]);

  return <>{children}</>;
}
