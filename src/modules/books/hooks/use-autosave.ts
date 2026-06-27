"use client";

import { useCallback, useRef, useEffect } from "react";

export function useAutosave<T>(
  key: string,
  data: T,
  saveFn: (data: T) => Promise<void>,
  delay = 3000,
) {
  const savedRef = useRef(data);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  useEffect(() => {
    savedRef.current = data;
  }, [data]);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await saveFnRef.current(savedRef.current);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveFnRef.current(savedRef.current).catch(() => {});
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, delay]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return { flush };
}
