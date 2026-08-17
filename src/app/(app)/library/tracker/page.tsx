import Link from "next/link";
import { IconArrowLeft, IconBooks } from "@tabler/icons-react";
import { getCurrentUserId } from "@/core/auth";
import { getReadingDashboard } from "@/modules/reading";
import { LibraryContent } from "./LibraryContent";

/**
 * The reading tracker.
 *
 * Two different things share the word "library", and this is the other one: the
 * reading room at `/library` holds what you have *written*, and this holds what
 * you are *reading*. They sit next to each other under one route because that
 * is how a person thinks about a library, and they stay separate surfaces
 * because tracking a book's progress and reading your own journal have nothing
 * in common but the noun.
 *
 * This page keeps Life OS's own chrome — it is a tool, not a mode. The link
 * back up is the only thing the move to `/library/tracker` added.
 */
export default async function ReadingTrackerPage() {
  const userId = await getCurrentUserId();
  const dashboard = userId ? await getReadingDashboard(userId) : null;

  return (
    <>
      {/* Plain elements rather than Mantine's `component={Link}`: this is a
          server component, and `component` hands a function across the
          server/client boundary — which is a build error, not a runtime one. */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          <li>
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 text-[var(--mantine-color-dimmed)] transition-colors hover:text-[var(--mantine-color-text)]"
            >
              <IconArrowLeft size={14} />
              <IconBooks size={14} />
              The Library
            </Link>
          </li>
          <li aria-hidden="true" className="text-[var(--mantine-color-dimmed)]">
            /
          </li>
          <li className="font-medium" aria-current="page">
            Reading Tracker
          </li>
        </ol>
      </nav>

      <LibraryContent initialDashboard={dashboard} />
    </>
  );
}
