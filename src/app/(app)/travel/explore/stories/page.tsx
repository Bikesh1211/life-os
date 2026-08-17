import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconScript } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { requireAuth } from "@/core/auth";
import { loadArchive } from "@/modules/travel/explore/explore.server";
import { ArchiveCrumb } from "../_components/archive-crumb";
import styles from "../_components/explore.module.css";

export const metadata: Metadata = {
  title: "Travel Stories",
  description: "The written accounts of the expeditions.",
};

/**
 * The written accounts.
 *
 * A travel story exists once, as a journal. This page is the *expedition* door
 * onto the same content — it lists the journals and hands off to the reader.
 * Nothing is duplicated, and there is no second copy to drift.
 */
export default async function StoriesPage() {
  const userId = await requireAuth();
  const { stories, expeditions } = await loadArchive(userId);

  /* Trips whose narrative was never written up. Named rather than hidden: the
     gap in the record is part of the record, and each one is one click from
     the page where it could be. */
  const unwritten = expeditions.filter((e) => !e.storyHref);

  return (
    <main className="xp-container py-12 sm:py-16">
      <ArchiveCrumb />

      <header className="mb-10">
        <h1 className="xp-h2 tracking-[0.06em] uppercase">Travel Stories</h1>
        <p className="xp-body mt-4 max-w-2xl text-balance">
          The long-form accounts. They are your travel journals — one story, two doors — and this is
          the expedition side of it.
        </p>
        <p className="xp-label mt-4 text-[var(--xp-muted)]">
          {stories.length} {stories.length === 1 ? "story" : "stories"}
        </p>
      </header>

      {stories.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <li key={story.id}>
              <article
                className={cn(
                  styles.lift,
                  styles.card,
                  "group relative flex h-full flex-col rounded-md p-5",
                )}
              >
                <p className="xp-label mb-3 flex items-center gap-2 text-[var(--xp-muted)]">
                  <IconScript size={14} className="text-[var(--xp-primary)]" aria-hidden="true" />
                  {story.tripTitle ?? (story.location || "Travel journal")}
                </p>

                <h2 className="text-lg font-semibold text-balance">
                  <Link href={story.href} className="after:absolute after:inset-0">
                    {story.title}
                  </Link>
                </h2>

                {story.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-[var(--xp-muted)]">
                    {story.description}
                  </p>
                )}

                {story.date && (
                  <p className="xp-label mt-3 text-[var(--xp-muted)]">
                    <time dateTime={story.date}>
                      {new Date(story.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </p>
                )}

                <span className="xp-label mt-auto flex items-center gap-1.5 pt-5 text-[var(--xp-primary)]">
                  Read the account
                  <IconArrowRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-[var(--xp-border)] px-6 py-16 text-center text-sm text-[var(--xp-muted)] italic">
          No travel stories written yet. Add a journal in Travel and it appears here.
        </p>
      )}

      {unwritten.length > 0 && (
        <section className="mt-16">
          <h2 className="xp-label mb-5 text-[var(--xp-muted)]">Expeditions still unwritten</h2>
          <ul className="flex flex-wrap gap-2">
            {unwritten.map((expedition) => (
              <li key={expedition.id}>
                <Link
                  href={`/travel/explore/trips/${expedition.slug}`}
                  className="rounded-full border border-[var(--xp-border)] px-3 py-1 text-xs text-[var(--xp-muted)] transition-colors hover:border-[color-mix(in_oklab,var(--xp-primary)_40%,transparent)] hover:text-[var(--xp-fg)]"
                >
                  {expedition.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
