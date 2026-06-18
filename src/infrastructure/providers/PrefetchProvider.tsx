"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const PREFETCH_ROUTES = [
  "/api/timeline",
  "/api/notes",
  "/api/goals",
];

const PREFETCH_HEADERS = {
  "Content-Type": "application/json",
};

export function PrefetchProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const prefetched = useRef(false);

  useEffect(() => {
    if (prefetched.current) return;
    prefetched.current = true;

    const controller = new AbortController();

    for (const url of PREFETCH_ROUTES) {
      queryClient.prefetchQuery({
        queryKey: [url],
        queryFn: () =>
          fetch(url, { signal: controller.signal, headers: PREFETCH_HEADERS }).then(
            (res) => (res.ok ? res.json() : Promise.resolve(null)),
          ),
        staleTime: 120_000,
      });
    }
  }, [queryClient]);

  return <>{children}</>;
}
