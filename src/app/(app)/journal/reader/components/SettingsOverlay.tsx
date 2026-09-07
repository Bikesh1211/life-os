"use client";

import type { ReadingSettings } from "../types";

type Props = {
  open: boolean;
  settings: ReadingSettings;
  onClose: () => void;
  onSetTheme: (theme: string) => void;
  onAdjustFontSize: (delta: number) => void;
  onSetLineHeight: (lh: string) => void;
  onSetWidth: (w: string) => void;
  onSetFont: (f: string) => void;
};

export function SettingsOverlay({
  open,
  settings,
  onClose,
  onSetTheme,
  onAdjustFontSize,
  onSetLineHeight,
  onSetWidth,
  onSetFont,
}: Props) {
  return (
    <div
      className={`overlay overlay-slide-left ${open ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Reading settings"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="overlay-panel">
        <div className="overlay-header">
          <h2 className="overlay-title">Reading</h2>
          <button className="overlay-close" onClick={onClose} aria-label="Close settings">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overlay-body">
          <section className="setting-group">
            <h3 className="setting-label">Font size</h3>
            <div className="setting-fsize">
              <button className="fsize-btn fsize-min" onClick={() => onAdjustFontSize(-1)} aria-label="Decrease font size">A−</button>
              <span className="fsize-value">{settings.fontSize}%</span>
              <button className="fsize-btn fsize-max" onClick={() => onAdjustFontSize(1)} aria-label="Increase font size">A+</button>
            </div>
          </section>

          <section className="setting-group">
            <h3 className="setting-label">Line height</h3>
            <div className="setting-options">
              {(["compact", "comfortable", "relaxed"] as const).map((v) => (
                <button
                  key={v}
                  className={`setting-option ${settings.lineHeight === v ? "is-active" : ""}`}
                  onClick={() => onSetLineHeight(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section className="setting-group">
            <h3 className="setting-label">Reading width</h3>
            <div className="setting-options">
              {(["narrow", "normal", "wide"] as const).map((v) => (
                <button
                  key={v}
                  className={`setting-option ${settings.width === v ? "is-active" : ""}`}
                  onClick={() => onSetWidth(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section className="setting-group">
            <h3 className="setting-label">Font</h3>
            <div className="setting-options">
              {(["serif", "sans", "mono"] as const).map((v) => (
                <button
                  key={v}
                  className={`setting-option ${settings.font === v ? "is-active" : ""}`}
                  onClick={() => onSetFont(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </section>

          <section className="setting-group">
            <h3 className="setting-label">Theme</h3>
            <div className="theme-swatches">
              {([
                { key: "day", label: "Day", cls: "theme-swatch-day" },
                { key: "sepia", label: "Sepia", cls: "theme-swatch-sepia" },
                { key: "dark", label: "Night", cls: "theme-swatch-dark" },
                { key: "minimal", label: "Minimal", cls: "theme-swatch-minimal" },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  className={`theme-swatch ${t.cls} ${settings.theme === t.key ? "is-active" : ""}`}
                  onClick={() => onSetTheme(t.key)}
                >
                  <span className="theme-swatch-circle" />
                  <span className="theme-swatch-label">{t.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
