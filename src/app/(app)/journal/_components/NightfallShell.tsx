"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArrowLeft,
  IconCalendarTime,
  IconChartHistogram,
  IconMoon,
  IconNotebook,
  IconPencilPlus,
} from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { useAppShell } from "../../AppShellProvider";

/**
 * NIGHTFALL — the journal's own chrome.
 *
 * Built to the pattern the Library and Explore established, because that is
 * what makes those two feel like places rather than pages: the mode asks the
 * app shell to stand down, puts up its own rail, and paints its own night on a
 * fixed layer behind everything.
 *
 * The three parts, in the order they matter:
 *
 *   The rail names the room and carries its sections, so you know where you
 *   are before reading a word — the single thing that most separates a mode
 *   from a colour scheme.
 *
 *   `.vd-night` is the atmosphere: moonlight from the upper right, mist across
 *   it, the corners falling away. Fixed, so it never repaints on scroll, and
 *   entirely gradients, so it costs one paint and no requests.
 *
 *   `minimalChrome` folds away Life OS's sidebar and header for as long as this
 *   is mounted, and restores them on the way out — by the rail's exit, the back
 *   button, or a command-palette jump.
 */

const SECTIONS = [
  { href: "/journal", label: "Entries", icon: IconNotebook, exact: true },
  { href: "/journal/timeline", label: "Timeline", icon: IconCalendarTime },
  { href: "/journal/insights", label: "Insights", icon: IconChartHistogram },
  { href: "/journal/drafts", label: "Drafts", icon: IconPencilPlus },
];

export function NightfallShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setMinimalChrome } = useAppShell();

  useEffect(() => {
    setMinimalChrome(true);
    return () => setMinimalChrome(false);
  }, [setMinimalChrome]);

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  }

  /* Writing gets the room without the furniture. A rail of section links over
     a page whose whole job is a blank page is the interface talking during the
     one moment it should be quiet. */
  const writing = pathname === "/journal/new";

  return (
    <div className="vd">
      <div className="vd-night" aria-hidden="true" />

      <div className="relative z-[1]">
        {!writing && (
          <div className="sticky top-0 z-[1050] border-b border-[var(--vd-border)] bg-[var(--vd-bg)]/90 backdrop-blur-xl">
            <div className="vd-container flex h-14 items-center gap-3">
              <Link
                href="/journal"
                className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
              >
                <IconMoon size={18} className="text-[var(--vd-rose)]" />
                <span className="hidden text-sm font-medium tracking-[0.2em] sm:inline">
                  NIGHTFALL
                </span>
                <span className="sr-only">The journal</span>
              </Link>

              <nav
                className="scrollbar-hide ml-2 flex min-w-0 items-center gap-0.5 overflow-x-auto"
                aria-label="Journal"
              >
                {SECTIONS.map(({ href, label, exact }) => {
                  const active = isActive(href, exact);
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-md px-2.5 py-1.5 text-[13px] whitespace-nowrap transition-colors",
                        active
                          ? "font-medium text-[var(--vd-rose)]"
                          : "text-[var(--vd-muted)] hover:bg-[color-mix(in_oklab,var(--vd-fg)_6%,transparent)] hover:text-[var(--vd-fg)]",
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>

              <div className="ml-auto flex shrink-0 items-center gap-1">
                <Link
                  href="/dashboard"
                  title="Leave the journal"
                  className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-[var(--vd-muted)] transition-colors hover:bg-[color-mix(in_oklab,var(--vd-fg)_6%,transparent)] hover:text-[var(--vd-fg)]"
                >
                  <IconArrowLeft size={16} />
                  <span className="hidden lg:inline">Exit</span>
                  <span className="sr-only">Leave the journal</span>
                </Link>

                <span className="mx-1 h-5 w-px bg-[var(--vd-border)]" />

                {/* The one filled control: the only thing here that writes. */}
                <Link
                  href="/journal/new"
                  className="flex items-center gap-1.5 rounded-md bg-[var(--vd-rose)] px-3 py-1.5 text-[13px] font-medium text-[var(--vd-void)] transition-opacity hover:opacity-90"
                >
                  <IconPencilPlus size={16} />
                  <span className="hidden sm:inline">Write</span>
                  <span className="sr-only">Write an entry</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {writing && (
          /* The way back, and nothing else. */
          <div className="vd-container pt-6">
            <Link
              href="/journal"
              className="vd-caption inline-flex items-center gap-1.5 text-[var(--vd-muted)] transition-colors hover:text-[var(--vd-rose)]"
            >
              <IconArrowLeft size={12} />
              Nightfall
            </Link>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
