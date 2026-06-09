"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "../design-system/SectionHeading";
import Link from "next/link";

type Obsession = {
  id: string;
  title: string;
  type: "artist" | "album";
  imageUrl?: string | null;
  stat?: string;
};

export function Obsessions({ items }: { items?: Obsession[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Current Obsessions" />
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link href={`/music/${item.type === "artist" ? "artists" : "albums"}/${item.id}`}>
              <div className="group relative h-44 overflow-hidden rounded-2xl sm:h-52">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[var(--mantine-color-dark-6,#1a1b1e)] text-6xl text-white/10">
                    ♪
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/60">
                    {item.type === "artist" ? "Artist" : "Album"}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white">{item.title}</h3>
                  {item.stat && (
                    <p className="mt-1 text-sm text-white/70">{item.stat}</p>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
