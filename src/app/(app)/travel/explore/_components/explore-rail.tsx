"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArrowLeft,
  IconClock,
  IconCompass,
  IconMap,
  IconMapPin,
  IconPencilPlus,
  IconPhoto,
  IconScript,
  IconSearch,
  IconTent,
} from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { CompassMark } from "./compass-rose";

/**
 * The archive's own navigation.
 *
 * Explore's destinations are routes, not tabs on one page, so they cannot live
 * in the Travel dashboard's tab strip. This is the archive's own bar.
 *
 * Three tiers of weight, because a row where everything looks equally important
 * is a row nothing stands out in:
 *
 *   The seven *sections* are quiet text — they are where you go, and the active
 *   one is the only coloured thing among them.
 *
 *   Search and the way out are ghost icon buttons. Both are always reachable
 *   and neither is a place, so neither takes a border or a colour.
 *
 *   The desk is the one filled button, because it is the only thing here that
 *   *changes* the archive rather than reading it.
 *
 * The two category shortcuts this bar used to carry are gone. There are eight
 * kinds and the bar was showing two of them, which made the pair look like the
 * whole set; the front page's "By kind" grid offers all eight, which is the
 * honest way in.
 *
 * The way out is always present and always says where it goes. Explore hides
 * Life OS's sidebar while it is open, so a mode with no visible exit would be a
 * trap — see `ExploreChrome`.
 */

const SECTIONS = [
  { href: "/travel/explore", label: "Map", icon: IconMap, exact: true },
  { href: "/travel/explore/trips", label: "Expeditions", icon: IconTent },
  { href: "/travel/explore/places", label: "Places", icon: IconMapPin },
  { href: "/travel/explore/timeline", label: "Timeline", icon: IconClock },
  { href: "/travel/explore/gallery", label: "Gallery", icon: IconPhoto },
  { href: "/travel/explore/stories", label: "Stories", icon: IconScript },
  { href: "/travel/explore/bucket-list", label: "Bucket List", icon: IconCompass },
];

const DESK = { href: "/travel/explore/manage", label: "Add record", icon: IconPencilPlus };

export function ExploreRail({ onOpenSearch }: { onOpenSearch: () => void }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  }

  const onDesk = isActive(DESK.href);

  return (
    <div className="sticky top-0 z-[1050] border-b border-[var(--xp-border)] bg-[var(--xp-bg)]/90 backdrop-blur-xl">
      <div className="xp-container flex h-14 items-center gap-3">
        {/* ── The mark ─────────────────────────────────────────────────── */}
        <Link
          href="/travel/explore"
          className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
        >
          <CompassMark className="size-[18px] text-[var(--xp-primary)]" />
          {/* The wordmark sheds a word at a time rather than vanishing: at any
              width the bar still says what this place is. */}
          <span className="hidden text-sm font-semibold tracking-[0.1em] xl:inline">
            ADVENTURE ARCHIVE
          </span>
          <span className="hidden text-sm font-semibold tracking-[0.1em] sm:inline xl:hidden">
            ARCHIVE
          </span>
          <span className="sr-only">The Adventure Archive home</span>
        </Link>

        {/* ── The sections ─────────────────────────────────────────────── */}
        {/* `min-w-0` plus a hidden-scrollbar overflow rather than a fixed row:
            seven labels fit comfortably from `lg` up, but a longer section name
            or a wider font must not push search and the exit off the bar. The
            nav gives way first, and it gives way by scrolling. */}
        <nav
          className="scrollbar-hide hidden min-w-0 items-center gap-0.5 overflow-x-auto lg:flex"
          aria-label="Archive sections"
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
                    ? "font-medium text-[var(--xp-primary)]"
                    : "text-[var(--xp-muted)] hover:bg-[color-mix(in_oklab,var(--xp-fg)_6%,transparent)] hover:text-[var(--xp-fg)]",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onOpenSearch}
            title="Search the archive"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[var(--xp-muted)] transition-colors hover:bg-[color-mix(in_oklab,var(--xp-fg)_6%,transparent)] hover:text-[var(--xp-fg)]"
          >
            <IconSearch size={16} />
            <kbd className="hidden rounded border border-[var(--xp-border)] px-1 font-mono text-[10px] leading-4 sm:inline">
              /
            </kbd>
            <span className="sr-only">Search the expedition archive</span>
          </button>

          <Link
            href="/travel"
            title="Exit to Travel"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-[var(--xp-muted)] transition-colors hover:bg-[color-mix(in_oklab,var(--xp-fg)_6%,transparent)] hover:text-[var(--xp-fg)]"
          >
            <IconArrowLeft size={16} />
            <span className="hidden xl:inline">Exit</span>
            <span className="sr-only">Exit to Travel</span>
          </Link>

          <span className="mx-1 h-5 w-px bg-[var(--xp-border)]" />

          {/* The one filled control: the only thing on this bar that writes. */}
          <Link
            href={DESK.href}
            aria-current={onDesk ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-opacity hover:opacity-90",
              onDesk
                ? "bg-[color-mix(in_oklab,var(--xp-primary)_16%,transparent)] text-[var(--xp-primary)]"
                : "bg-[var(--xp-primary)] text-white",
            )}
          >
            <DESK.icon size={16} />
            <span className="hidden sm:inline">{DESK.label}</span>
            <span className="sr-only">{DESK.label}</span>
          </Link>
        </div>
      </div>

      {/* ── Below lg: the sections as a scrolling chip row ───────────────
          Seven destinations do not fit a phone in any arrangement, and a
          scrolling row keeps every one of them reachable without hiding four
          behind a menu button. The desk is not repeated here — it is already
          the filled button above, at every width. */}
      <nav className="border-t border-[var(--xp-border)] lg:hidden" aria-label="Archive sections">
        <ul className="xp-container scrollbar-hide flex gap-1.5 overflow-x-auto py-2">
          {SECTIONS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs whitespace-nowrap transition-colors",
                    active
                      ? "bg-[color-mix(in_oklab,var(--xp-primary)_14%,transparent)] font-medium text-[var(--xp-primary)]"
                      : "text-[var(--xp-muted)]",
                  )}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
