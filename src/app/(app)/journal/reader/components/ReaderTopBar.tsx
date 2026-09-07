"use client";

import { useCallback } from "react";

type Props = {
  currentIndex: number;
  total: number;
  onOpenToc: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onBack: () => void;
};

export function ReaderTopBar({
  currentIndex,
  total,
  onOpenToc,
  onOpenSearch,
  onOpenSettings,
  onBack,
}: Props) {
  return (
    <header className="reader-topbar" role="banner">
      <div className="topbar-left">
        <button className="icon-btn" onClick={onBack} aria-label="Back to journal" title="Back">
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <span className="topbar-title">My Journal</span>
      </div>
      <div className="topbar-center" aria-live="polite">
        {total > 0 ? `Entry ${currentIndex + 1} of ${total}` : "No entries"}
      </div>
      <div className="topbar-right">
        <button className="icon-btn" onClick={onOpenToc} aria-label="Table of contents" title="Contents (T)">
          <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
        </button>
        <button className="icon-btn" onClick={onOpenSearch} aria-label="Search journal" title="Search (/)">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
        </button>
        <button className="icon-btn" onClick={onOpenSettings} aria-label="Reading settings" title="Settings (A)">
          <svg viewBox="0 0 24 24"><path d="M12 20h9M3 20h4M7 20a3 3 0 0 1 6 0M3 4h9M18 4h3M18 4a3 3 0 0 0-6 0M3 12h16M21 12a3 3 0 0 1-6 0" /></svg>
        </button>
      </div>
    </header>
  );
}
