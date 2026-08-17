"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  BACKGROUND_INTENSITY_KEY,
  CONTEXT_MODE_KEY,
  DEFAULT_CONTEXT_MODE,
  DEFAULT_INTENSITY,
  isContextMode,
  isIntensity,
  type BackgroundIntensity,
  type ContextMode,
} from "./index";

/**
 * The two cinematic preferences, read from the document.
 *
 * Same shape as `useMovieTheme` and for the same reason: the attributes on the
 * document element are the truth — the boot script writes them before React
 * exists — so subscribing to them keeps the settings controls honest even
 * across a second tab or a back-navigation.
 *
 * One string for both, because `useSyncExternalStore` compares snapshots by
 * identity and a fresh object every call would re-render forever.
 */

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== CONTEXT_MODE_KEY && event.key !== BACKGROUND_INTENSITY_KEY) return;
    apply(readMode(), readIntensity());
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function readMode(): ContextMode {
  try {
    const stored = window.localStorage.getItem(CONTEXT_MODE_KEY);
    return isContextMode(stored) ? stored : DEFAULT_CONTEXT_MODE;
  } catch {
    return DEFAULT_CONTEXT_MODE;
  }
}

function readIntensity(): BackgroundIntensity {
  try {
    const stored = window.localStorage.getItem(BACKGROUND_INTENSITY_KEY);
    return isIntensity(stored) ? stored : DEFAULT_INTENSITY;
  } catch {
    return DEFAULT_INTENSITY;
  }
}

function apply(mode: ContextMode, intensity: BackgroundIntensity) {
  const root = document.documentElement;
  root.setAttribute("data-context-mode", mode);
  root.setAttribute("data-bg-intensity", intensity);
}

function snapshot(): string {
  const root = document.documentElement;
  const mode = root.getAttribute("data-context-mode");
  const intensity = root.getAttribute("data-bg-intensity");
  return `${isContextMode(mode) ? mode : DEFAULT_CONTEXT_MODE}|${
    isIntensity(intensity) ? intensity : DEFAULT_INTENSITY
  }`;
}

const serverSnapshot = () => `${DEFAULT_CONTEXT_MODE}|${DEFAULT_INTENSITY}`;

export function useContextTheme() {
  const combined = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [mode, intensity] = combined.split("|") as [ContextMode, BackgroundIntensity];

  const setMode = useCallback((next: ContextMode) => {
    document.documentElement.setAttribute("data-context-mode", next);
    try {
      window.localStorage.setItem(CONTEXT_MODE_KEY, next);
    } catch {
      // Applies for this session; will not survive a reload.
    }
    emit();
  }, []);

  const setIntensity = useCallback((next: BackgroundIntensity) => {
    document.documentElement.setAttribute("data-bg-intensity", next);
    try {
      window.localStorage.setItem(BACKGROUND_INTENSITY_KEY, next);
    } catch {
      // As above.
    }
    emit();
  }, []);

  return { mode, intensity, setMode, setIntensity };
}
