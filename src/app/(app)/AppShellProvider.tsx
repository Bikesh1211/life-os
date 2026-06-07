"use client";

import { useState, createContext, useContext, useCallback, type ReactNode } from "react";

type AppShellContextType = {
  opened: boolean;
  mobileOpened: boolean;
  minimalChrome: boolean;
  toggle: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
  setMinimalChrome: (v: boolean) => void;
};

const AppShellContext = createContext<AppShellContextType | null>(null);

export function AppShellNavbarProvider({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useState(true);
  const [mobileOpened, setMobileOpened] = useState(false);
  const [minimalChrome, setMinimalChrome] = useState(false);

  const toggle = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 576) {
      setMobileOpened((m) => !m);
    } else {
      setOpened((o) => !o);
    }
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpened((m) => !m);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpened(false);
  }, []);

  return (
    <AppShellContext.Provider value={{ opened, mobileOpened, minimalChrome, toggle, toggleMobile, closeMobile, setMinimalChrome }}>
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used within AppShellNavbarProvider");
  return ctx;
}
