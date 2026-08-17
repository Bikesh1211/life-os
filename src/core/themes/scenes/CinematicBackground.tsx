"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { SCENES } from "./scenes";
import { VIEW_H, VIEW_W } from "./random";
import { contextForPath, isExemptPath } from "../contexts/contexts";
import { SCENE_FOR } from "../contexts";

/**
 * The cinematic environment behind every page.
 *
 * The layer stack, back to front:
 *
 *   1  the light      where the lamp is, as CSS gradients
 *   2  the drawing    the scene's SVG — shelves, ridgelines, a skyline
 *   3  the readability wash  a gradient to the page colour, so prose always wins
 *
 * One fixed element, painted once. It never repaints on scroll (fixed, not
 * absolute), never re-mounts on navigation (the scene swaps inside it), and
 * holds no image — every environment is drawing instructions, so a route change
 * costs a re-render of some SVG paths and nothing else.
 *
 * Three things are deliberately absent: canvas, a particle engine, and any
 * animation loop. The only motion in the entire system is a slow opacity drift
 * on dust motes, and that is CSS, and it stops under `prefers-reduced-motion`.
 */

const OPACITY: Record<string, number> = {
  minimal: 0.3,
  balanced: 0.62,
  cinematic: 1,
};

/** Reads an attribute off `<html>` and stays subscribed to changes on it. */
function useRootAttribute(name: string, fallback: string): string {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setValue(root.getAttribute(name) ?? fallback);
    read();

    /* The settings controls write the attribute directly — no context, no
       store — so an observer is what keeps this in step with them. */
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: [name] });
    return () => observer.disconnect();
  }, [name, fallback]);

  return value;
}

/** True on viewports where the full drawing is more cost than it is worth. */
function useCompact(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(max-width: 768px)");
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(max-width: 768px)").matches,
    () => false,
  );
}

export function CinematicBackground() {
  const pathname = usePathname();
  const mode = useRootAttribute("data-context-mode", "full");
  const intensity = useRootAttribute("data-bg-intensity", "balanced");
  const compact = useCompact();
  const layerRef = useRef<HTMLDivElement>(null);

  /* The context attribute is written by this same effect so the palette and the
     scene can never disagree about which room you are in. */
  const exempt = isExemptPath(pathname);
  const context = exempt ? undefined : contextForPath(pathname);

  useEffect(() => {
    const root = document.documentElement;
    if (exempt) root.setAttribute("data-context", "none");
    else if (context) root.setAttribute("data-context", context.id);
    else root.removeAttribute("data-context");
  }, [exempt, context]);

  if (exempt || !context || mode === "off") return null;

  const scene = SCENES[SCENE_FOR[context.id] ?? "glass"]?.();
  if (!scene) return null;

  /* Mobile gets the light and the wash but not the drawing. The scene is the
     expensive half and the half that reads as clutter at 390px — the light is
     what actually carries the atmosphere, and it costs nothing. */
  const base = OPACITY[intensity] ?? OPACITY.balanced;
  const opacity = compact ? base * 0.5 : base;

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={
        {
          opacity,
          transition: "opacity 200ms ease",
          /*
           * The scene's accent, defined once here and inherited by every
           * element and every light gradient below.
           *
           * The fallback chain is not defensive padding — it is load-bearing.
           * `--scene-accent` appears inside `color-mix()` in the light layer,
           * and an undefined custom property makes the whole gradient invalid
           * at computed-value time, which drops the light entirely. On mobile,
           * where the drawing is skipped, the light is the *only* layer — so an
           * unset variable there is the difference between an atmosphere and a
           * blank page. Context accent first, then the global movie theme's,
           * then the authored literal, which always exists.
           */
          "--scene-accent": `var(--ctx-accent, var(--lo-accent, ${context.palette.accent}))`,
        } as React.CSSProperties
      }
    >
      {/* 1 — the light */}
      <div className="absolute inset-0" style={{ backgroundImage: scene.light }} />

      {/* 2 — the drawing */}
      {!compact && (
        <svg
          className="absolute inset-0 size-full"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          /* `currentColor` is the scene's ink; the accent comes through a
             variable. Setting both here means every element in the library
             re-tints per room without taking a single prop. */
          style={{ color: "var(--lo-text-primary, currentColor)" }}
        >
          {scene.art}
        </svg>
      )}

      {/* 3 — the readability wash. Always the last word: whatever the scene
             does, body copy sits on the page colour. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, color-mix(in oklab, var(--lo-background, #000) 40%, transparent) 0%, color-mix(in oklab, var(--lo-background, #000) 66%, transparent) 48%, color-mix(in oklab, var(--lo-background, #000) 86%, transparent) 100%)",
        }}
      />
    </div>
  );
}
