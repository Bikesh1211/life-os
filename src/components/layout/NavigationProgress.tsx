"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 600);
    }
  }, [pathname, searchParams]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.15s ease" }}
    >
      <div
        className="h-full w-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-500"
        style={{
          animation: visible ? "nav-progress 0.6s ease-in-out" : "none",
          transformOrigin: "left center",
        }}
      />
      <style>{`
        @keyframes nav-progress {
          0% { transform: scaleX(0); }
          40% { transform: scaleX(0.6); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
