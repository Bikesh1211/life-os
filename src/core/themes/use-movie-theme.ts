"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useMantineColorScheme } from "@mantine/core";
import {
  DEFAULT_DEPTH,
  DEPTH_STORAGE_KEY,
  THEME_STORAGE_KEY,
  isDepth,
  isThemeId,
  themeById,
  type ThemeDepth,
  type ThemeId,
} from "./index";

/**
 * The selected theme, and how to change it.
 *
 * There is no provider and no context, which is the point: the theme lives on
 * the document element as a data attribute, and CSS does the rest. React only
 * needs to know the current value so the settings grid can tick the right card
 * — nothing else in the application re-renders when a theme changes, because
 * nothing else reads it.
 *
 * `useSyncExternalStore` over the DOM attribute rather than a `useState`: the
 * attribute is the truth (the boot script sets it before React exists), and
 * subscribing to it means a second tab, a back-navigation or the boot script
 * itself can never leave the toggle out of step with the page.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  /* A change in another tab is a change here: the preference is one per
     browser, so a theme picked on one page should not leave another page
     showing a stale tick. */
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== DEPTH_STORAGE_KEY) return;
    applyToDocument(read(), readDepth());
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function read(): ThemeId {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(stored) ? stored : "default";
  } catch {
    // A blocked store means no preference, not a broken page.
    return "default";
  }
}

function readDepth(): ThemeDepth {
  try {
    const stored = window.localStorage.getItem(DEPTH_STORAGE_KEY);
    return isDepth(stored) ? stored : DEFAULT_DEPTH;
  } catch {
    return DEFAULT_DEPTH;
  }
}

/**
 * One string for both attributes, because `useSyncExternalStore` compares
 * snapshots by identity — returning a fresh `{ themeId, depth }` object every
 * call would re-render on every scheduler tick forever.
 */
function snapshot(): string {
  const root = document.documentElement;
  const theme = root.getAttribute("data-movie-theme");
  const depth = root.getAttribute("data-theme-depth");
  return `${isThemeId(theme) ? theme : "default"}|${isDepth(depth) ? depth : DEFAULT_DEPTH}`;
}

/** The server has no document and no storage; it renders the default. */
const serverSnapshot = (): string => `default|${DEFAULT_DEPTH}`;

/**
 * Selecting `default` *removes* the attribute rather than setting it to
 * "default" — an absent attribute matches no theme block, so Life OS's own
 * palette applies with nothing overriding it. Setting a sentinel value would
 * mean writing a fifth, empty theme whose only job is to undo the other four.
 */
function applyToDocument(id: ThemeId, depth: ThemeDepth) {
  const root = document.documentElement;
  if (id === "default") root.removeAttribute("data-movie-theme");
  else root.setAttribute("data-movie-theme", id);
  root.setAttribute("data-theme-depth", depth);
}

export function useMovieTheme() {
  const combined = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [themeId, depth] = combined.split("|") as [ThemeId, ThemeDepth];
  const { setColorScheme } = useMantineColorScheme();

  const setTheme = useCallback(
    (id: ThemeId) => {
      applyToDocument(id, readDepth());

      try {
        if (id === "default") window.localStorage.removeItem(THEME_STORAGE_KEY);
        else window.localStorage.setItem(THEME_STORAGE_KEY, id);
      } catch {
        // The theme still applies for this session; it just will not survive
        // a reload. Not worth failing the interaction over.
      }

      /* Themes are not only palettes — Dune is a lit room and the other three
         are dark ones, and Mantine renders whole components differently per
         scheme. Picking a theme therefore picks its scheme. `default` leaves
         the reader's own choice alone. */
      const theme = themeById(id);
      if (theme) setColorScheme(theme.scheme);

      emit();
    },
    [setColorScheme],
  );

  const setDepth = useCallback((next: ThemeDepth) => {
    document.documentElement.setAttribute("data-theme-depth", next);
    try {
      window.localStorage.setItem(DEPTH_STORAGE_KEY, next);
    } catch {
      // Applies for this session; will not survive a reload.
    }
    emit();
  }, []);

  return { themeId, depth, setTheme, setDepth };
}
