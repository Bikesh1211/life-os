"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  AMBIENT_EFFECTS_KEY,
  BACKGROUND_INTENSITY_KEY,
  CONTEXT_MODE_KEY,
  DEFAULT_AMBIENT,
  DEFAULT_CONTEXT_MODE,
  DEFAULT_INTENSITY,
  DEFAULT_MOTION,
  MOTION_KEY,
  isAmbient,
  isContextMode,
  isIntensity,
  isMotion,
  type AmbientEffects,
  type BackgroundIntensity,
  type ContextMode,
  type MotionPreference,
} from "./index";

/**
 * The cinematic preferences, read from the document.
 *
 * Same shape as `useMovieTheme` and for the same reason: the attributes on the
 * document element are the truth — the boot script writes them before React
 * exists — so subscribing to them keeps the settings controls honest even
 * across a second tab or a back-navigation.
 *
 * Four preferences now, described in one table rather than four near-identical
 * copies of read/apply/set. The snapshot is a single joined string because
 * `useSyncExternalStore` compares snapshots by identity, and a fresh object
 * every call would re-render forever.
 */

interface Pref<T extends string> {
  /** The attribute on `<html>`, which is where the truth lives. */
  attribute: string;
  key: string;
  fallback: T;
  valid: (value: unknown) => value is T;
}

/* Order is load-bearing: the snapshot is split back out positionally. */
const PREFS = [
  {
    attribute: "data-context-mode",
    key: CONTEXT_MODE_KEY,
    fallback: DEFAULT_CONTEXT_MODE,
    valid: isContextMode,
  } satisfies Pref<ContextMode>,
  {
    attribute: "data-bg-intensity",
    key: BACKGROUND_INTENSITY_KEY,
    fallback: DEFAULT_INTENSITY,
    valid: isIntensity,
  } satisfies Pref<BackgroundIntensity>,
  {
    attribute: "data-ambient",
    key: AMBIENT_EFFECTS_KEY,
    fallback: DEFAULT_AMBIENT,
    valid: isAmbient,
  } satisfies Pref<AmbientEffects>,
  {
    attribute: "data-motion",
    key: MOTION_KEY,
    fallback: DEFAULT_MOTION,
    valid: isMotion,
  } satisfies Pref<MotionPreference>,
] as const;

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

/** The stored value if it is one we recognise, else the default. */
function read(pref: (typeof PREFS)[number]): string {
  try {
    const stored = window.localStorage.getItem(pref.key);
    return pref.valid(stored) ? stored : pref.fallback;
  } catch {
    /* Private browsing, or storage disabled. The default is still a theme. */
    return pref.fallback;
  }
}

function subscribe(listener: Listener) {
  listeners.add(listener);

  /* Another tab changed a preference: mirror it onto this document so both
     windows agree, rather than letting them drift apart until a reload. */
  const onStorage = (event: StorageEvent) => {
    const pref = PREFS.find((entry) => entry.key === event.key);
    if (!pref) return;
    document.documentElement.setAttribute(pref.attribute, read(pref));
    listener();
  };

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function snapshot(): string {
  const root = document.documentElement;
  return PREFS.map((pref) => {
    const value = root.getAttribute(pref.attribute);
    return pref.valid(value) ? value : pref.fallback;
  }).join("|");
}

const SERVER_SNAPSHOT = PREFS.map((pref) => pref.fallback).join("|");
const serverSnapshot = () => SERVER_SNAPSHOT;

function write(pref: (typeof PREFS)[number], next: string) {
  document.documentElement.setAttribute(pref.attribute, next);
  try {
    window.localStorage.setItem(pref.key, next);
  } catch {
    // Applies for this session; will not survive a reload.
  }
  emit();
}

export function useContextTheme() {
  const combined = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [mode, intensity, ambient, motion] = combined.split("|") as [
    ContextMode,
    BackgroundIntensity,
    AmbientEffects,
    MotionPreference,
  ];

  const setMode = useCallback((next: ContextMode) => write(PREFS[0], next), []);
  const setIntensity = useCallback((next: BackgroundIntensity) => write(PREFS[1], next), []);
  const setAmbient = useCallback((next: AmbientEffects) => write(PREFS[2], next), []);
  const setMotion = useCallback((next: MotionPreference) => write(PREFS[3], next), []);

  return { mode, intensity, ambient, motion, setMode, setIntensity, setAmbient, setMotion };
}
