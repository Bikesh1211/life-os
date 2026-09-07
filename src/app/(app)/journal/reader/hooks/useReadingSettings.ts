"use client";

import { useState, useCallback, useEffect } from "react";
import type { ReadingSettings } from "../types";

const SIZES = [80, 92, 100, 112, 125, 140, 155];

const DEFAULTS: ReadingSettings = {
  theme: "day",
  fontSize: 100,
  lineHeight: "comfortable",
  width: "normal",
  font: "serif",
};

function readSettings(): ReadingSettings {
  if (typeof window === "undefined") return DEFAULTS;
  const get = (k: string, fallback: string) => {
    try { return localStorage.getItem("journal:" + k) ?? fallback; } catch { return fallback; }
  };
  const fs = parseInt(get("font-size", "100"), 10);
  return {
    theme: get("theme", DEFAULTS.theme),
    fontSize: isNaN(fs) ? DEFAULTS.fontSize : fs,
    lineHeight: get("line-height", DEFAULTS.lineHeight),
    width: get("reading-width", DEFAULTS.width),
    font: get("reader-font", DEFAULTS.font),
  };
}

function save(key: string, value: string) {
  try { localStorage.setItem("journal:" + key, value); } catch {}
}

export function useReadingSettings() {
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULTS);

  useEffect(() => {
    setSettings(readSettings());
  }, []);

  const apply = useCallback((s: ReadingSettings) => {
    const body = document.body;
    body.setAttribute("data-theme", s.theme);
    body.setAttribute("data-line-height", s.lineHeight);
    body.setAttribute("data-reading-width", s.width);
    body.setAttribute("data-reader-font", s.font);
    const rem = (s.fontSize / 100) * 1.15;
    body.style.setProperty("--reading-font-size", rem + "rem");
  }, []);

  useEffect(() => {
    apply(settings);
  }, [settings, apply]);

  const setTheme = useCallback((theme: string) => {
    setSettings((s) => {
      const next = { ...s, theme };
      save("theme", theme);
      return next;
    });
  }, []);

  const adjustFontSize = useCallback((delta: number) => {
    setSettings((s) => {
      const idx = SIZES.indexOf(s.fontSize);
      const next = SIZES[Math.min(Math.max(idx + delta, 0), SIZES.length - 1)];
      save("font-size", String(next));
      return { ...s, fontSize: next };
    });
  }, []);

  const setLineHeight = useCallback((lineHeight: string) => {
    setSettings((s) => {
      save("line-height", lineHeight);
      return { ...s, lineHeight };
    });
  }, []);

  const setWidth = useCallback((width: string) => {
    setSettings((s) => {
      save("reading-width", width);
      return { ...s, width };
    });
  }, []);

  const setFont = useCallback((font: string) => {
    setSettings((s) => {
      save("reader-font", font);
      return { ...s, font };
    });
  }, []);

  return { settings, setTheme, adjustFontSize, setLineHeight, setWidth, setFont };
}
