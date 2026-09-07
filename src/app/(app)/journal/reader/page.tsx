"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useReadingSettings } from "./hooks/useReadingSettings";
import { useJournalData } from "./hooks/useJournalData";
import { useNavigation } from "./hooks/useNavigation";
import { useGestures } from "./hooks/useGestures";
import { ReaderTopBar } from "./components/ReaderTopBar";
import { ReaderContent } from "./components/ReaderContent";
import { MobileControls } from "./components/MobileControls";
import { TocOverlay } from "./components/TocOverlay";
import { SearchOverlay } from "./components/SearchOverlay";
import { SettingsOverlay } from "./components/SettingsOverlay";
import { Toast } from "./components/Toast";
import "./reader.css";

export default function JournalReaderPage() {
  const { settings, setTheme, adjustFontSize, setLineHeight, setWidth, setFont } = useReadingSettings();
  const { entries, loading, load, wordsOfEntry, readMinutes } = useJournalData();
  const { currentIndex, goTo, navTo } = useNavigation(entries);
  const [tocOpen, setTocOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { load(); }, [load]);

  const handleNav = useCallback(
    (dir: -1 | 1) => {
      const result = navTo(dir);
      if (result) setToast(result === "first" ? "You are at the first entry" : "You have reached the end");
    },
    [navTo],
  );

  const handleBack = useCallback(() => {
    window.location.href = "/journal";
  }, []);

  useGestures(handleNav);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement).isContentEditable;
      if (typing) return;

      if (e.key === "Escape") {
        if (tocOpen) { setTocOpen(false); return; }
        if (searchOpen) { setSearchOpen(false); return; }
        if (settingsOpen) { setSettingsOpen(false); return; }
      }

      if (tocOpen || searchOpen || settingsOpen) return;

      switch (e.key) {
        case "ArrowLeft": e.preventDefault(); handleNav(-1); break;
        case "ArrowRight": e.preventDefault(); handleNav(1); break;
        case "Home": e.preventDefault(); goTo(0); break;
        case "End": e.preventDefault(); goTo(entries.length - 1); break;
        case "t": case "T": if (!e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); setTocOpen((v) => !v); } break;
        case "/": e.preventDefault(); setSearchOpen((v) => !v); break;
        case "a": case "A": if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); setSettingsOpen((v) => !v); } break;
        case "+": case "=": e.preventDefault(); adjustFontSize(1); break;
        case "-": case "_": e.preventDefault(); adjustFontSize(-1); break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tocOpen, searchOpen, settingsOpen, handleNav, goTo, entries.length, adjustFontSize]);

  // Reading progress
  useEffect(() => {
    const fill = document.getElementById("progress-fill");
    if (!fill) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.min(Math.max(doc.scrollTop / max, 0), 1) : 0;
        fill.style.width = (pct * 100).toFixed(2) + "%";
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Edge nav hover
  useEffect(() => {
    const prevWrap = document.getElementById("nav-prev");
    const nextWrap = document.getElementById("nav-next");
    let hideTimer: ReturnType<typeof setTimeout>;
    const show = (el: HTMLElement | null) => el?.classList.add("is-visible");
    const hide = () => { prevWrap?.classList.remove("is-visible"); nextWrap?.classList.remove("is-visible"); };
    const schedule = () => { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 2600); };
    const onMove = (e: PointerEvent | MouseEvent) => {
      if ("pointerType" in e && e.pointerType !== "mouse") return;
      if (window.innerWidth <= 768) return;
      const x = "clientX" in e ? e.clientX : 0;
      if (x <= 180) { show(prevWrap); nextWrap?.classList.remove("is-visible"); }
      else if (x >= window.innerWidth - 180) { show(nextWrap); prevWrap?.classList.remove("is-visible"); }
      else hide();
      schedule();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mousemove", onMove);
      clearTimeout(hideTimer);
    };
  }, []);

  const entry = entries[currentIndex];

  return (
    <div className="reader-app" data-theme={settings.theme}>
      <ReaderTopBar
        currentIndex={currentIndex}
        total={entries.length}
        onOpenToc={() => setTocOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onBack={handleBack}
      />

      <main id="reader-main" className="reading-container">
        {loading ? (
          <div className="reading-paper reader-page" id="reader-page">
            <section className="entry-reader reader-empty">
              <p className="entry-number">My Journal</p>
              <h1 className="entry-title">Loading…</h1>
            </section>
          </div>
        ) : entries.length === 0 ? (
          <div className="reading-paper reader-page" id="reader-page">
            <section className="entry-reader reader-empty">
              <p className="entry-number">My Journal</p>
              <h1 className="entry-title">Your journal is still opening</h1>
              <p className="reader-empty-line">There are no entries here yet.</p>
              <p className="reader-empty-line">The first page is waiting to be written.</p>
            </section>
          </div>
        ) : (
          <ReaderContent
            entry={entry}
            index={currentIndex}
            total={entries.length}
            wordsOfEntry={wordsOfEntry}
            readMinutes={readMinutes}
          />
        )}
      </main>

      <div className="reading-progress-track" aria-hidden="true">
        <div className="reading-progress-fill" id="progress-fill" />
      </div>

      <nav className="page-nav page-nav-prev" id="nav-prev" aria-label="Previous entry">
        <button className="page-nav-btn" onClick={() => handleNav(-1)} aria-label="Previous entry">
          <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
      </nav>
      <nav className="page-nav page-nav-next" id="nav-next" aria-label="Next entry">
        <button className="page-nav-btn" onClick={() => handleNav(1)} aria-label="Next entry">
          <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </nav>

      <MobileControls
        currentIndex={currentIndex}
        total={entries.length}
        onPrev={() => handleNav(-1)}
        onNext={() => handleNav(1)}
        onOpenToc={() => setTocOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <TocOverlay
        open={tocOpen}
        entries={entries}
        currentIndex={currentIndex}
        onClose={() => setTocOpen(false)}
        onGoTo={goTo}
      />

      <SearchOverlay
        open={searchOpen}
        entries={entries}
        onClose={() => setSearchOpen(false)}
        onGoTo={goTo}
      />

      <SettingsOverlay
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSetTheme={setTheme}
        onAdjustFontSize={adjustFontSize}
        onSetLineHeight={setLineHeight}
        onSetWidth={setWidth}
        onSetFont={setFont}
      />

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
