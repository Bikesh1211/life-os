"use client";

import { useState, createContext, useContext, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useHotkeys } from "@mantine/hooks";

const COLLAPSED_KEY = "life-os:sidebar-collapsed";

type AppShellContextType = {
  opened: boolean;
  mobileOpened: boolean;
  collapsed: boolean;
  minimalChrome: boolean;
  toggle: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
  toggleCollapsed: () => void;
  setCollapsed: (v: boolean) => void;
  setMinimalChrome: (v: boolean) => void;
};

const AppShellContext = createContext<AppShellContextType | null>(null);

function loadCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "true";
  } catch {
    return false;
  }
}

function saveCollapsed(v: boolean) {
  localStorage.setItem(COLLAPSED_KEY, String(v));
}

export function AppShellNavbarProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [opened, setOpened] = useState(true);
  const [collapsed, setCollapsedState] = useState(false);
  const [mobileOpened, setMobileOpened] = useState(false);
  const [minimalChrome, setMinimalChrome] = useState(false);

  useEffect(() => {
    setCollapsedState(loadCollapsed());
  }, []);

  const toggle = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 576) {
      setMobileOpened((m) => !m);
    } else {
      setOpened((prev) => !prev);
    }
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpened((m) => !m);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpened(false);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      saveCollapsed(next);
      return next;
    });
  }, []);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    saveCollapsed(v);
  }, []);

  useHotkeys([
    ["mod+\\", toggle],
    ["mod+Shift+J", () => router.push("/journal/new")],
    ["mod+Shift+K", () => router.push("/tasks?create=true")],
    ["mod+Shift+H", () => router.push("/habits?action=log")],
    ["mod+Shift+L", () => router.push("/timeline?create=true")],
  ]);

  return (
    <AppShellContext.Provider
      value={{
        opened,
        mobileOpened,
        collapsed,
        minimalChrome,
        toggle,
        toggleMobile,
        closeMobile,
        toggleCollapsed,
        setCollapsed,
        setMinimalChrome,
      }}
    >
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used within AppShellNavbarProvider");
  return ctx;
}
