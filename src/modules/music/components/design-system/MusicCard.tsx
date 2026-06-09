"use client";

import { motion } from "framer-motion";

type MusicCardProps = {
  imageUrl?: string | null;
  title: string;
  subtitle?: string | null;
  href?: string;
  aspectRatio?: "square" | "portrait";
  badge?: string | null;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  overlay?: React.ReactNode;
};

const sizeClasses = {
  sm: "w-36 sm:w-40",
  md: "w-44 sm:w-48",
  lg: "w-52 sm:w-56",
};

export function MusicCard({
  imageUrl,
  title,
  subtitle,
  aspectRatio = "square",
  badge,
  size = "md",
  onClick,
  overlay,
}: MusicCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group cursor-pointer ${sizeClasses[size]}`}
      onClick={onClick}
    >
      <div
        className={`relative overflow-hidden rounded-xl bg-[var(--mantine-color-dark-6,#1a1b1e)] ${
          aspectRatio === "square" ? "aspect-square" : "aspect-[3/4]"
        }`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-white/20">
            ♪
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
        {overlay && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {overlay}
          </div>
        )}
        {badge && (
          <div className="absolute right-2 top-2 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
            {badge}
          </div>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <p className="truncate text-sm font-medium text-[var(--mantine-color-text,#c1c2c5)]">
          {title}
        </p>
        {subtitle && (
          <p className="truncate text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
