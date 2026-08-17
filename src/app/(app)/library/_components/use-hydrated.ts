"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether React has hydrated.
 *
 * `useSyncExternalStore` with a constant client snapshot and a constant server
 * snapshot is the hook's intended shape for exactly this: the server says
 * `false`, the client says `true`, and React reconciles the difference on
 * hydration — without a `setState` in an effect and the extra render pass that
 * comes with one.
 *
 * The library needs it wherever the server cannot know the answer: the saved
 * count in the rail, a filled bookmark, a progress ring. Those wait for this
 * rather than rendering a zero they would immediately have to correct.
 */
const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, onClient, onServer);
}

/**
 * Jumps to a heading without the sticky chrome sitting on top of it.
 *
 * The default anchor jump puts the element's top at the viewport's top, which
 * in this application is behind the library rail. The offset is the rail's
 * height plus a little air, and `scrollIntoView` is not used because it has no
 * way to express one.
 */
export function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  const OFFSET = 96;
  const top = element.getBoundingClientRect().top + window.scrollY - OFFSET;

  window.scrollTo({
    top,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });

  // The URL should still change — a reader who lands on a section wants to be
  // able to share it — but without the browser's own un-offset jump.
  history.replaceState(null, "", `#${id}`);
}
