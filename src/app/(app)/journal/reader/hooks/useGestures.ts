"use client";

import { useEffect, useRef } from "react";

export function useGestures(onSwipe: (dir: -1 | 1) => void) {
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);

  useEffect(() => {
    const area = document.getElementById("reader-main");
    if (!area) return;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      tracking.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking.current) return;
      const touch = e.touches[0];
      const dy = touch.clientY - startY.current;
      const dx = touch.clientX - startX.current;
      if (Math.abs(dy) > 120 || Math.abs(dx) < 48) tracking.current = false;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking.current) return;
      tracking.current = false;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;
      if (Math.abs(dx) < 72 || Math.abs(dy) > Math.abs(dx)) return;
      onSwipe(dx > 0 ? -1 : 1);
    };

    area.addEventListener("touchstart", onTouchStart, { passive: true });
    area.addEventListener("touchmove", onTouchMove, { passive: true });
    area.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      area.removeEventListener("touchstart", onTouchStart);
      area.removeEventListener("touchmove", onTouchMove);
      area.removeEventListener("touchend", onTouchEnd);
    };
  }, [onSwipe]);
}
