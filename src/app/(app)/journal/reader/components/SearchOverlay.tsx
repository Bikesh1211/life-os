"use client";

import { useRef, useEffect } from "react";
import { useSearch } from "../hooks/useSearch";
import type { ReaderEntry } from "../types";

type Props = {
  open: boolean;
  entries: ReaderEntry[];
  onClose: () => void;
  onGoTo: (index: number) => void;
};

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function SearchOverlay({ open, entries, onClose, onGoTo }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results, snippet } = useSearch(entries);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  return (
    <div
      className={`overlay overlay-slide-right ${open ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Search journal"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="overlay-panel">
        <div className="overlay-header">
          <h2 className="overlay-title">Search</h2>
          <button className="overlay-close" onClick={onClose} aria-label="Close search">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overlay-body">
          <div className="search-input-wrap">
            <svg className="search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            <input
              ref={inputRef}
              type="search"
              className="search-input"
              placeholder="Search titles, days, places, moods…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const first = document.querySelector(".search-result") as HTMLButtonElement | null;
                  if (first) first.click();
                }
              }}
            />
          </div>
          <p className="search-results-meta">
            {query.trim()
              ? `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`
              : `Search the journal — ${entries.length} entries`}
          </p>
          <ul className="search-results">
            {results.length === 0 ? (
              <li className="search-empty">No pages found for &ldquo;{query}&rdquo;.</li>
            ) : (
              results.map((r) => (
                <li key={r.idx}>
                  <button
                    className="search-result"
                    onClick={() => { onClose(); onGoTo(r.idx); }}
                  >
                    <span className="search-result-head">
                      <span className="search-date">{formatDate(r.entry.date)}</span>
                    </span>
                    <span className="search-result-title">{r.entry.title}</span>
                    <span
                      className="search-result-snippet"
                      dangerouslySetInnerHTML={{ __html: snippet(r) }}
                    />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
