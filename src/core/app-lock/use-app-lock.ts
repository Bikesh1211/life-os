"use client";

import { useEffect, useRef } from "react";
import {
  STORAGE_KEYS,
  loadFromStorage,
  removeFromStorage,
} from "./utils";
import { useAppLockStore } from "./store";

function isGloballyDisabled(): boolean {
  const disabledUntil = loadFromStorage(STORAGE_KEYS.disabledUntil, "");
  if (disabledUntil === "") return false;
  if (disabledUntil === "tab-close") return true;
  return Date.now() < new Date(disabledUntil).getTime();
}

export function useAppLock() {
  const initialize = useAppLockStore((s) => s.initialize);
  const setLocked = useAppLockStore((s) => s.setLocked);
  const enabled = useAppLockStore((s) => s.enabled);
  const timeoutMin = useAppLockStore((s) => s.timeoutMin);
  const isInitialized = useAppLockStore((s) => s.isInitialized);

  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabCloseRef = useRef(false);

  useEffect(() => {
    initialize();

    const handleVisibilityChange = () => {
      if (document.hidden) return;

      if (!enabled) return;

      const disabledUntil = loadFromStorage<string>(STORAGE_KEYS.disabledUntil, "");

      if (disabledUntil === "tab-close") {
        if (tabCloseRef.current) {
          removeFromStorage(STORAGE_KEYS.disabledUntil);
          setLocked(true);
        }
        tabCloseRef.current = false;
        return;
      }

      if (disabledUntil === "") {
        setLocked(true);
        return;
      }

      const until = new Date(disabledUntil).getTime();
      if (Date.now() > until) {
        removeFromStorage(STORAGE_KEYS.disabledUntil);
        setLocked(true);
      }
    };

    const handleTabClose = () => {
      tabCloseRef.current = true;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [enabled, initialize, setLocked]);

  useEffect(() => {
    if (!enabled || !isInitialized) return;
    if (isGloballyDisabled()) return;

    const handleActivity = () => {
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
      if (timeoutMin > 0) {
        activityTimerRef.current = setTimeout(() => {
  const disabledUntil = loadFromStorage<string>(STORAGE_KEYS.disabledUntil, "");
          if (disabledUntil === "") {
            setLocked(true);
          }
        }, timeoutMin * 60 * 1000);
      }
    };

    handleActivity();

    document.addEventListener("mousedown", handleActivity);
    document.addEventListener("keydown", handleActivity);

    return () => {
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
      document.removeEventListener("mousedown", handleActivity);
      document.removeEventListener("keydown", handleActivity);
    };
  }, [enabled, timeoutMin, isInitialized, setLocked]);
}
