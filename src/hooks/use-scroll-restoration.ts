"use client";

import { useEffect, useRef } from "react";

const scrollPositions = new Map<string, number>();

export function useScrollRestoration(pathname: string) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const saved = scrollPositions.get(pathname);
    if (saved !== undefined) {
      container.scrollTop = saved;
    }

    return () => {
      scrollPositions.set(pathname, container.scrollTop);
    };
  }, [pathname]);

  return containerRef;
}
