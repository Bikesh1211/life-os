"use client";

import { useEffect } from "react";
import { useAppShell } from "../../../AppShellProvider";

/**
 * Reader Mode chrome.
 *
 * Hides the app shell (sidebar, header, mobile nav) so the journal reader
 * takes over the full window — same pattern as the Travel module's Explore Mode.
 * Restores the chrome on unmount when the user navigates away.
 */
export function ReaderChrome({ children }: { children: React.ReactNode }) {
  const { setMinimalChrome } = useAppShell();

  useEffect(() => {
    setMinimalChrome(true);
    document.documentElement.setAttribute("data-reading", "on");
    return () => {
      setMinimalChrome(false);
      document.documentElement.removeAttribute("data-reading");
    };
  }, [setMinimalChrome]);

  return (
    <div
      className="min-h-screen"
      style={{
        margin: "calc(var(--app-shell-padding, 0px) * -1)",
        background: "var(--color-bg, #faf9f6)",
      }}
    >
      {children}
    </div>
  );
}
