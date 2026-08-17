import type { Metadata } from "next";
import { requireAuth } from "@/core/auth";
import { buildIndex } from "@/modules/library";
import { loadLibrary } from "@/modules/library/library.server";
import { LibraryChrome } from "../_components/library-chrome";

export const metadata: Metadata = {
  title: {
    default: "The Library",
    template: "%s — The Library",
  },
  description: "Things you have written, imagined, experienced, and learned.",
};

/**
 * The library's shell.
 *
 * A route group rather than a plain layout, and that is the whole reason
 * `(room)` exists: `/library/tracker` is the reading *tracker*, a Mantine
 * surface with Life OS's own palette, and it sits outside this group so it does
 * not inherit the reading room's chrome. Route groups do not appear in URLs, so
 * the addresses are unchanged.
 *
 * The archive is read once here and the *index* — metadata plus opening prose,
 * not the full text of every book — is handed to the chrome, so search works
 * over the same set the pages render from without shipping the whole library to
 * the browser. Every page below renders inside this, which is also what puts
 * them all inside the reader context.
 */
export default async function LibraryRoomLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireAuth();
  const library = await loadLibrary(userId);

  return (
    <div className="lb min-h-screen">
      <LibraryChrome catalogue={buildIndex(library)}>{children}</LibraryChrome>
    </div>
  );
}
