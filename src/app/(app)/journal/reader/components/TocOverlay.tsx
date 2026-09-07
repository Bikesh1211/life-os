"use client";

import type { ReaderEntry } from "../types";

type Props = {
  open: boolean;
  entries: ReaderEntry[];
  currentIndex: number;
  onClose: () => void;
  onGoTo: (index: number) => void;
};

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatYear(iso: string) {
  if (!iso) return "";
  return String(new Date(iso + "T12:00:00").getFullYear());
}

function formatMonth(iso: string) {
  if (!iso) return "";
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return months[new Date(iso + "T12:00:00").getMonth()];
}

export function TocOverlay({ open, entries, currentIndex, onClose, onGoTo }: Props) {
  const groups = new Map<string, Map<string, { entry: ReaderEntry; idx: number }[]>>();
  entries.forEach((entry, idx) => {
    const year = formatYear(entry.date);
    const month = formatMonth(entry.date);
    if (!groups.has(year)) groups.set(year, new Map());
    if (!groups.get(year)!.has(month)) groups.get(year)!.set(month, []);
    groups.get(year)!.get(month)!.push({ entry, idx });
  });

  return (
    <div
      className={`overlay overlay-slide-right ${open ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Table of contents"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="overlay-panel">
        <div className="overlay-header">
          <h2 className="overlay-title">Contents</h2>
          <button className="overlay-close" onClick={onClose} aria-label="Close contents">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overlay-body">
          {entries.length === 0 ? (
            <p className="toc-empty">No entries yet.</p>
          ) : (
            Array.from(groups.entries()).map(([year, months]) => (
              <div key={year} className="toc-group">
                <h3 className="toc-year">{year}</h3>
                {Array.from(months.entries()).map(([month, items]) => (
                  <div key={month}>
                    <h4 className="toc-month">{month}</h4>
                    <ul className="toc-list">
                      {items.map(({ entry, idx }) => (
                        <li key={idx}>
                          <button
                            className={`toc-entry ${idx === currentIndex ? "is-active" : ""}`}
                            onClick={() => { onClose(); onGoTo(idx); }}
                          >
                            <span className="toc-num">{String(idx + 1).padStart(2, "0")}</span>
                            <span className="toc-title">
                              <span className="toc-main-title">{entry.title}</span>
                              <span className="toc-date">{formatDate(entry.date)}</span>
                            </span>
                            <span className="toc-meta">
                              {entry.category ? <span className="toc-category">{entry.category}</span> : null}
                              {(() => {
                                const words = entry.content.reduce((sum: number, b: any) => {
                                  const t = "text" in b ? b.text : "";
                                  return sum + t.replace(/[^a-z0-9'\s]/gi, " ").split(/\s+/).filter(Boolean).length;
                                }, 0);
                                return entry.readTime || Math.max(1, Math.round(words / 200));
                              })()} min
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
