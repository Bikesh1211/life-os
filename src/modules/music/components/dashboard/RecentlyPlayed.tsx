"use client";

import { motion } from "framer-motion";
import { MusicCard } from "../design-system/MusicCard";
import { SectionHeading } from "../design-system/SectionHeading";
import Link from "next/link";

type Album = {
  id: string;
  title: string;
  coverArtUrl?: string | null;
  artistName?: string;
};

export function RecentlyPlayed({ albums }: { albums?: Album[] }) {
  if (!albums || albums.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Recently Played" action={{ label: "See all", href: "/music/history" }} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="no-scrollbar flex gap-4 overflow-x-auto pb-2"
      >
        {albums.map((album, i) => (
          <motion.div
            key={album.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * i }}
          >
            <Link href={`/music/albums/${album.id}`}>
              <MusicCard
                imageUrl={album.coverArtUrl}
                title={album.title}
                subtitle={album.artistName}
                size="md"
              />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
