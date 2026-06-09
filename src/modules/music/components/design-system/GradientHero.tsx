"use client";

import { motion } from "framer-motion";
import { MusicContainer } from "./MusicContainer";

type GradientHeroProps = {
  imageUrl?: string | null;
  title: string;
  subtitle?: string | null;
  gradientFrom?: string;
  gradientTo?: string;
  children?: React.ReactNode;
  compact?: boolean;
};

function extractColors(_url: string): [string, string] {
  return ["#1a1a2e", "#16213e"];
}

export function GradientHero({
  imageUrl,
  title,
  subtitle,
  gradientFrom,
  gradientTo,
  children,
  compact,
}: GradientHeroProps) {
  const [from, to] = imageUrl
    ? extractColors(imageUrl)
    : [gradientFrom ?? "#1a1a2e", gradientTo ?? "#0f0f23"];

  return (
    <div className="relative -mx-4 -mt-6 overflow-hidden sm:-mx-6 lg:-mx-8">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${from} 0%, ${to} 50%, var(--color-body, #0a0a0f) 100%)`,
        }}
      />
      {imageUrl && (
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(60px)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-body,#0a0a0f)]" />
      <MusicContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`relative z-10 ${compact ? "py-8" : "py-16 sm:py-24"}`}
        >
          <div className="flex items-end gap-6">
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`shrink-0 overflow-hidden rounded-2xl shadow-2xl ${compact ? "h-24 w-24 sm:h-32 sm:w-32" : "h-40 w-40 sm:h-56 sm:w-56"}`}
              >
                <img
                  src={imageUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            )}
            <div className="min-w-0 flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
              >
                {title}
              </motion.h1>
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-2 text-lg text-white/70 sm:text-xl"
                >
                  {subtitle}
                </motion.p>
              )}
              {children && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="mt-4 flex flex-wrap gap-3"
                >
                  {children}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </MusicContainer>
    </div>
  );
}
