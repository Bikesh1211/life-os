"use client";

type Props = {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onOpenToc: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
};

export function MobileControls({
  currentIndex,
  total,
  onPrev,
  onNext,
  onOpenToc,
  onOpenSearch,
  onOpenSettings,
}: Props) {
  return (
    <nav className="mobile-controls" aria-label="Reading controls">
      <button className="icon-btn" onClick={onPrev} aria-label="Previous entry">
        <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
      </button>
      <span className="mobile-progress-label">
        {total > 0 ? `${currentIndex + 1} / ${total}` : "0 / 0"}
      </span>
      <button className="icon-btn" onClick={onOpenToc} aria-label="Table of contents">
        <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
      </button>
      <button className="icon-btn" onClick={onOpenSearch} aria-label="Search journal">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
      </button>
      <button className="icon-btn" onClick={onOpenSettings} aria-label="Reading settings">
        <svg viewBox="0 0 24 24"><path d="M12 20h9M3 20h4M7 20a3 3 0 0 1 6 0M3 4h9M18 4h3M18 4a3 3 0 0 0-6 0M3 12h16M21 12a3 3 0 0 1-6 0" /></svg>
      </button>
      <button className="icon-btn" onClick={onNext} aria-label="Next entry">
        <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </button>
    </nav>
  );
}
