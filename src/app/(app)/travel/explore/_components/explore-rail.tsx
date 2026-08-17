"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArrowLeft,
  IconBackpack,
  IconClock,
  IconCompass,
  IconMap,
  IconMapPin,
  IconMountain,
  IconPhoto,
  IconScript,
  IconSearch,
  IconTent,
} from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { CompassMark } from "./compass-rose";
import styles from "./explore.module.css";

/**
 * The archive's own navigation.
 *
 * Explore's destinations are routes, not tabs on one page, so they cannot live
 * in the Travel dashboard's tab strip. This is the archive's own bar: the mark
 * and its name on the left, the sections in the middle, search and the way back
 * on the right.
 *
 * Nine destinations do not fit a phone in any arrangement, so below `xl` they
 * become a horizontally scrolling chip row rather than a menu: a scrolling row
 * keeps every section reachable without hiding four of them behind a button.
 *
 * The way out is always present and always says where it goes. Explore hides
 * Life OS's sidebar while it is open, so a mode with no visible exit would be
 * a trap — see `ExploreChrome`.
 */

const DESTINATIONS = [
  { href: "/travel/explore", label: "Map", icon: IconMap, exact: true },
  { href: "/travel/explore/trips", label: "Expeditions", icon: IconTent },
  { href: "/travel/explore/places", label: "Places", icon: IconMapPin },
  { href: "/travel/explore/mountains", label: "Mountains", icon: IconMountain },
  { href: "/travel/explore/adventures", label: "Adventure", icon: IconBackpack },
  { href: "/travel/explore/stories", label: "Stories", icon: IconScript },
  { href: "/travel/explore/gallery", label: "Gallery", icon: IconPhoto },
  { href: "/travel/explore/timeline", label: "Timeline", icon: IconClock },
  { href: "/travel/explore/bucket-list", label: "Bucket List", icon: IconCompass },
];

export function ExploreRail({ onOpenSearch }: { onOpenSearch: () => void }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="sticky top-0 z-[1050] border-b border-[var(--xp-border)] bg-[var(--xp-bg)]/90 backdrop-blur-xl">
      <div className="xp-container flex h-12 items-center gap-2">
        <Link
          href="/travel/explore"
          className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-[0.12em]"
        >
          <CompassMark className="size-4 text-[var(--xp-primary)]" />
          <span className="hidden sm:inline">THE ADVENTURE ARCHIVE</span>
          <span className="sr-only">The Adventure Archive home</span>
        </Link>

        <span className="mx-1 hidden h-4 w-px bg-[var(--xp-border)] xl:block" />

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Archive">
          {DESTINATIONS.slice(1).map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "rounded-sm px-2 py-1.5 text-xs font-medium transition-colors",
                isActive(href)
                  ? "bg-[color-mix(in_oklab,var(--xp-primary)_12%,transparent)] text-[var(--xp-primary)]"
                  : "text-[var(--xp-muted)] hover:text-[var(--xp-fg)]",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenSearch}
            className={cn(
              styles.lift,
              "flex items-center gap-2 rounded-sm border border-[var(--xp-border)] px-2.5 py-1.5 text-xs text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-fg)]",
            )}
          >
            <IconSearch size={14} />
            <span className="hidden lg:inline">Search the archive…</span>
            <kbd className="hidden rounded-sm border border-[var(--xp-border)] px-1 py-0.5 font-mono text-[10px] lg:inline">
              /
            </kbd>
            <span className="sr-only">Search the expedition archive</span>
          </button>

          <Link
            href="/travel"
            className="flex items-center gap-1.5 rounded-sm border border-[var(--xp-border)] px-2.5 py-1.5 text-xs text-[var(--xp-muted)] transition-colors hover:border-[color-mix(in_oklab,var(--xp-primary)_50%,transparent)] hover:text-[var(--xp-primary)]"
          >
            <IconArrowLeft size={14} />
            <span className="hidden xl:inline">Exit to Travel</span>
            <span className="xl:hidden">Exit</span>
          </Link>
        </div>
      </div>

      {/* Below xl: the sections as a scrolling chip row. */}
      <nav className="border-t border-[var(--xp-border)] xl:hidden" aria-label="Archive">
        <ul className="xp-container flex gap-1.5 overflow-x-auto py-2">
          {DESTINATIONS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs whitespace-nowrap transition-colors",
                    active
                      ? "border-[var(--xp-primary)] bg-[color-mix(in_oklab,var(--xp-primary)_12%,transparent)] text-[var(--xp-primary)]"
                      : "border-[var(--xp-border)] text-[var(--xp-muted)]",
                  )}
                >
                  <Icon size={12} />
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
