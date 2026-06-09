"use client";

import { IconClock, IconMusic, IconAlbum, IconFlame } from "@tabler/icons-react";
import { StatCard } from "../design-system/StatCard";

type Stats = {
  listeningTime: string;
  songsPlayed: number;
  albumsExplored: number;
  streak: number;
};

export function ListeningStats({ stats }: { stats?: Stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        value={stats.listeningTime}
        label="Listening today"
        icon={<IconClock size={18} />}
        delay={0}
      />
      <StatCard
        value={stats.songsPlayed}
        label="Songs played"
        icon={<IconMusic size={18} />}
        delay={0.05}
      />
      <StatCard
        value={stats.albumsExplored}
        label="Albums explored"
        icon={<IconAlbum size={18} />}
        delay={0.1}
      />
      <StatCard
        value={stats.streak}
        label="Day streak"
        icon={<IconFlame size={18} />}
        delay={0.15}
      />
    </div>
  );
}
