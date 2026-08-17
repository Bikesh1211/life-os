import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { IconArrowRight, IconCalendar, IconMapPin, IconMoodSmile } from "@tabler/icons-react";
import { requireAuth } from "@/core/auth";
import { loadArchive, loadStory } from "@/modules/travel/explore/explore.server";
import { ExpeditionCard } from "../../_components/expedition-card";
import { ArchiveCrumb } from "../../_components/archive-crumb";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const userId = await requireAuth();
  const story = await loadStory(userId, slug);
  if (!story) return {};
  return { title: story.title, description: story.description };
}

/**
 * One written account, read.
 *
 * The journal is the only copy of this text — the expedition page shows an
 * excerpt of it and links here for the rest. Paragraphs are split on blank
 * lines rather than rendered as markdown: a travel journal is prose typed into
 * a textarea, and treating its stray asterisks as emphasis would be reading
 * formatting into something nobody wrote as formatting.
 */
export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const userId = await requireAuth();
  const story = await loadStory(userId, slug);
  if (!story) notFound();

  const archive = await loadArchive(userId);
  const expedition = story.tripId
    ? archive.expeditions.find((e) => e.id === story.tripId)
    : undefined;

  const body = [story.content, story.story].filter(Boolean).join("\n\n");
  const paragraphs = body.split("\n").filter((line) => line.trim());

  return (
    <main className="pb-24">
      <header className="xp-narrow pt-10 sm:pt-14">
        <ArchiveCrumb label="Travel Stories" href="/travel/explore/stories" />

        <h1 className="xp-h2 text-balance">{story.title}</h1>

        <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--xp-muted)]">
          {story.date && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Date</dt>
              <IconCalendar size={14} aria-hidden="true" />
              <dd>
                <time dateTime={story.date}>
                  {new Date(story.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </dd>
            </div>
          )}
          {story.location && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Location</dt>
              <IconMapPin size={14} aria-hidden="true" />
              <dd>{story.location}</dd>
            </div>
          )}
          {story.mood && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Mood</dt>
              <IconMoodSmile size={14} aria-hidden="true" />
              <dd className="capitalize">{story.mood.replace(/_/g, " ")}</dd>
            </div>
          )}
        </dl>

        {expedition && (
          <Link
            href={`/travel/explore/trips/${expedition.slug}`}
            className="xp-label mt-6 inline-flex items-center gap-1.5 text-[var(--xp-primary)] hover:opacity-80"
          >
            Expedition {expedition.number} — {expedition.title}
            <IconArrowRight size={12} />
          </Link>
        )}
      </header>

      {story.coverImage && (
        <div className="xp-container mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element -- author-supplied
              URL of unknown origin; `next/image` needs each host declared in
              `remotePatterns` before the page will render at all. */}
          <img
            src={story.coverImage}
            alt=""
            className="aspect-[2/1] w-full rounded-md border border-[var(--xp-border)] object-cover"
          />
        </div>
      )}

      <article className="xp-narrow mt-12">
        {paragraphs.length > 0 ? (
          <div className="text-[1.0625rem] leading-[1.85] opacity-90">
            {paragraphs.map((line, i) => (
              <p key={i} className="mb-5">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-[var(--xp-border)] px-6 py-16 text-center text-sm text-[var(--xp-muted)] italic">
            This journal has a title but no account written under it yet.
          </p>
        )}
      </article>

      {expedition && (
        <section className="xp-container mt-16" aria-labelledby="from-expedition">
          <h2 id="from-expedition" className="xp-label mb-5 text-[var(--xp-muted)]">
            From this expedition
          </h2>
          <div className="max-w-md">
            <ExpeditionCard expedition={expedition} />
          </div>
        </section>
      )}
    </main>
  );
}
