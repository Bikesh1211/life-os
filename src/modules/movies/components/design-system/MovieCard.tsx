"use client";

import { motion } from "framer-motion";

type Props = {
  imageUrl: string | null;
  title: string;
  subtitle?: string;
  aspectRatio?: "poster" | "square" | "video";
  size?: "sm" | "md" | "lg";
  badge?: string;
  onClick?: () => void;
};

export function MovieCard({ imageUrl, title, subtitle, aspectRatio = "poster", size = "md", badge, onClick }: Props) {
  const sizeClasses = { sm: "w-32 sm:w-36", md: "w-40 sm:w-44", lg: "w-48 sm:w-52" };
  const aspectClasses = { poster: "aspect-[2/3]", square: "aspect-square", video: "aspect-video" };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className={`group cursor-pointer ${sizeClasses[size]}`} onClick={onClick}>
      <div className={`relative overflow-hidden rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)] ${aspectClasses[aspectRatio]}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-white/20">🎬</div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
        {badge && <div className="absolute right-2 top-2 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">{badge}</div>}
      </div>
      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-medium text-[var(--mantine-color-text,#c1c2c5)]">{title}</p>
        {subtitle && <p className="truncate text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
