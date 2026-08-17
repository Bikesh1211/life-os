"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppShell } from "../../../AppShellProvider";
import { ExploreRail } from "./explore-rail";
import { ArchiveSearch } from "./search-panel";
import { ExploreEntrance } from "./explore-entrance";
import type { ArchiveIndex } from "@/modules/travel/explore";

/**
 * Everything the archive wraps around a page: the rail, search and the way in.
 *
 * `children` arrives already rendered from the server layout, so every
 * `/travel/explore/*` page stays a server component and still sits inside this
 * client shell — React resolves the boundary, and nothing that only needs to be
 * *read* is shipped to the browser twice.
 *
 * `index` is what search works over. It is handed down once, here, rather than
 * fetched again by every surface that wants to look something up.
 *
 * Explore asks the app shell for minimal chrome, which is what makes it a mode
 * rather than a page: Life OS's sidebar, header and mobile bar step aside and
 * the archive's own rail takes their place. The effect restores the chrome on
 * unmount, so leaving by any route — the rail's exit, the back button, a
 * command palette jump — puts the application back the way it was found.
 */
export function ExploreChrome({
  index,
  children,
}: {
  index: ArchiveIndex;
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { setMinimalChrome } = useAppShell();

  useEffect(() => {
    setMinimalChrome(true);
    return () => setMinimalChrome(false);
  }, [setMinimalChrome]);

  /* `/` opens search. Ignored while a field has focus, or it would swallow a
     literal slash being typed into one. */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      event.preventDefault();
      setSearchOpen(true);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <ExploreRail onOpenSearch={() => setSearchOpen(true)} />
      {children}
      <ArchiveSearch index={index} open={searchOpen} onOpenChange={setSearchOpen} />
      {/* The curtain belongs to the way in, not to every section. */}
      {pathname === "/travel/explore" && <ExploreEntrance />}
    </>
  );
}
