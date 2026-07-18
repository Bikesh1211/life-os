"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

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

    const controller = new AbortController();

    for (const { key, url } of PREFETCH_CONFIGS) {
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: () =>
          fetch(url, { signal: controller.signal }).then(
            (res) => (res.ok ? res.json() : Promise.resolve(null)),
          ),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [queryClient]);

  return <>{children}</>;
}
