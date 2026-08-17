"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArrowLeft,
  IconBookmark,
  IconBooks,
  IconHome,
  IconSearch,
} from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { NAV_SHELVES, shelfHref } from "@/modules/library";
import { GrimoireMark } from "./marks";
import { useHydrated } from "./use-hydrated";
import { useReader } from "./reader";

/**
 * The library's own navigation.
 *
 * Three tiers of weight, because a row where everything looks equally important
 * is a row nothing stands out in:
 *
 *   The eight *shelves* are quiet text — they are where you go, and the active
 *   one is the only coloured thing among them.
 *
 *   Search, the tracker and the way out are ghost buttons. None of them is a
 *   shelf, so none of them takes a border or a colour.
 *
 *   Favourites is the one bordered control, because it is the only thing here
 *   that belongs to the *reader* rather than to the archive — and it is the one
 *   that carries a number.
 *
 * Eight shelves do not fit a phone in any arrangement, so below `xl` they
 * become a horizontally scrolling chip row: a scrolling row keeps every shelf
 * reachable without hiding five of them behind a menu.
 *
 * The `library-rail` class is load-bearing: `globals.css` folds it away in
 * reading mode.
 */
export function LibraryRail({ onOpenSearch }: { onOpenSearch: () => void }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { bookmarks } = useReader();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const onBookmarks = isActive("/library/bookmarks");

  return (
    <div className="library-rail sticky top-0 z-[1050] border-b border-[var(--lb-border)] bg-[var(--lb-bg)]/90 backdrop-blur-xl">
      <div className="lb-container flex h-14 items-center gap-3">
        {/* ── The mark ─────────────────────────────────────────────────── */}
        <Link
          href="/library"
          className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
        >
          <GrimoireMark className="size-[18px] text-[var(--lb-primary)]" ring={false} />
          {/* The wordmark sheds a word rather than vanishing: at any width the
              bar still says what this place is. */}
          <span className="hidden text-sm font-semibold tracking-[0.14em] xl:inline">
            THE LIBRARY
          </span>
          <span className="hidden text-sm font-semibold tracking-[0.14em] sm:inline xl:hidden">
            LIBRARY
          </span>
          <span className="sr-only">The Library home</span>
        </Link>

        {/* ── The shelves ──────────────────────────────────────────────── */}
        {/* `min-w-0` plus a hidden-scrollbar overflow: eight labels fit from
            `xl` up, but a longer shelf name must not push search and the exit
            off the bar. The nav gives way first, by scrolling. */}
        <nav
          className="scrollbar-hide hidden min-w-0 items-center gap-0.5 overflow-x-auto xl:flex"
          aria-label="Shelves"
        >
          {NAV_SHELVES.map((shelf) => {
            const href = shelfHref(shelf);
            const active = isActive(href);
            return (
              <Link
                key={shelf.segment}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-[13px] whitespace-nowrap transition-colors",
                  active
                    ? "font-medium text-[var(--lb-primary)]"
                    : "text-[var(--lb-muted)] hover:bg-[color-mix(in_oklab,var(--lb-fg)_6%,transparent)] hover:text-[var(--lb-fg)]",
                )}
              >
                {shelf.title}
              </Link>
            );
          })}
        </nav>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onOpenSearch}
            title="Search the library"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[var(--lb-muted)] transition-colors hover:bg-[color-mix(in_oklab,var(--lb-fg)_6%,transparent)] hover:text-[var(--lb-fg)]"
          >
            <IconSearch size={16} />
            <kbd className="hidden rounded border border-[var(--lb-border)] px-1 font-mono text-[10px] leading-4 sm:inline">
              /
            </kbd>
            <span className="sr-only">Search the library</span>
          </button>

          {/* The reading tracker, which is a different thing in the same room:
              this shelf is what you wrote, that one is what you are reading. */}
          <Link
            href="/library/tracker"
            title="Reading tracker"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-[var(--lb-muted)] transition-colors hover:bg-[color-mix(in_oklab,var(--lb-fg)_6%,transparent)] hover:text-[var(--lb-fg)]"
          >
            <IconBooks size={16} />
            <span className="hidden lg:inline">Tracker</span>
            <span className="sr-only">Reading tracker</span>
          </Link>

          <Link
            href="/dashboard"
            title="Exit the library"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-[var(--lb-muted)] transition-colors hover:bg-[color-mix(in_oklab,var(--lb-fg)_6%,transparent)] hover:text-[var(--lb-fg)]"
          >
            <IconArrowLeft size={16} />
            <span className="hidden xl:inline">Exit</span>
            <span className="sr-only">Exit the library</span>
          </Link>

          <span className="mx-1 h-5 w-px bg-[var(--lb-border)]" />

          <Link
            href="/library/bookmarks"
            aria-current={onBookmarks ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors",
              onBookmarks
                ? "border-[var(--lb-primary)] bg-[color-mix(in_oklab,var(--lb-primary)_12%,transparent)] text-[var(--lb-primary)]"
                : "border-[color-mix(in_oklab,var(--lb-primary)_40%,transparent)] text-[var(--lb-primary)] hover:bg-[color-mix(in_oklab,var(--lb-primary)_10%,transparent)]",
            )}
          >
            <IconBookmark size={16} />
            {/* The server has no idea what this reader saved — the count waits
                for hydration rather than rendering a "0" it would then have to
                correct. */}
            <span className="tabular-nums">
              {hydrated && bookmarks.length > 0 ? bookmarks.length : ""}
            </span>
            <span className="sr-only">
              Favourites{hydrated ? `, ${bookmarks.length} saved` : ""}
            </span>
          </Link>
        </div>
      </div>

      {/* ── Below xl: the shelves as a scrolling chip row ────────────────── */}
      <nav className="border-t border-[var(--lb-border)] xl:hidden" aria-label="Shelves">
        <ul className="lb-container scrollbar-hide flex gap-1.5 overflow-x-auto py-2">
          <li>
            <Link
              href="/library"
              aria-current={pathname === "/library" ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs whitespace-nowrap transition-colors",
                pathname === "/library"
                  ? "bg-[color-mix(in_oklab,var(--lb-primary)_14%,transparent)] font-medium text-[var(--lb-primary)]"
                  : "text-[var(--lb-muted)]",
              )}
            >
              <IconHome size={13} />
              Room
            </Link>
          </li>
          {NAV_SHELVES.map((shelf) => {
            const href = shelfHref(shelf);
            const active = isActive(href);
            return (
              <li key={shelf.segment}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs whitespace-nowrap transition-colors",
                    active
                      ? "bg-[color-mix(in_oklab,var(--lb-primary)_14%,transparent)] font-medium text-[var(--lb-primary)]"
                      : "text-[var(--lb-muted)]",
                  )}
                >
                  {shelf.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
