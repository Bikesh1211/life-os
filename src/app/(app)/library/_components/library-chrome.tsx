"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { LibraryIndexEntry } from "@/modules/library";
import { useAppShell } from "../../AppShellProvider";
import { ReaderProvider } from "./reader";
import { LibraryRail } from "./library-rail";
import { SearchPanel } from "./search-panel";
import { LibraryEntrance } from "./library-entrance";

/**
 * Everything the library wraps around a page: reader state, the rail, search
 * and the entrance.
 *
 * `children` arrives already rendered from the server layout, so the library's
 * pages stay server components and still sit inside the client-side reader
 * context — React resolves context through the boundary, and nothing that only
 * needs to be *read* is shipped to the browser twice.
 *
 * `catalogue` is the index the search box works over: titles, descriptions and
 * prose for everything published. It is the one place the whole archive is
 * handed to the client, and it is handed over once, here, rather than fetched
 * again by every surface that wants to look something up.
 *
 * The Library asks the app shell for minimal chrome, which is what makes it a
 * mode rather than a page: Life OS's sidebar, header and mobile bar step aside
 * and the library's own rail takes their place. The effect restores them on
 * unmount, so leaving by any route — the rail's exit, the back button, a
 * command-palette jump — puts the application back the way it was found.
 */
export function LibraryChrome({
  catalogue,
  children,
}: {
  catalogue: LibraryIndexEntry[];
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { setMinimalChrome } = useAppShell();

  // Reading mode hides the rail and owns the whole screen; the entrance would
  // be opening a door onto a page the reader is already inside.
  const reading = pathname.endsWith("/read");

  useEffect(() => {
    setMinimalChrome(true);
    return () => setMinimalChrome(false);
  }, [setMinimalChrome]);

  /* `/` opens search — the convention readers already know from the shop, and
     from every other catalogue on the web. Ignored while a field has focus, or
     it would swallow a literal slash. */
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
    <ReaderProvider>
      {!reading && <LibraryRail onOpenSearch={() => setSearchOpen(true)} />}
      {children}
      <SearchPanel library={catalogue} open={searchOpen} onOpenChange={setSearchOpen} />
      {pathname === "/library" && <LibraryEntrance />}
    </ReaderProvider>
  );
}
