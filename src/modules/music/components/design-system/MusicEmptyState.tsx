"use client";

import { motion } from "framer-motion";

type MusicEmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
};

export function MusicEmptyState({
  icon = "♪",
  title,
  description,
  action,
}: MusicEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--mantine-color-dark-6,#1a1b1e)] text-3xl text-[var(--mantine-color-dimmed,#5c5f66)]">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[var(--mantine-color-text,#c1c2c5)]">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 rounded-xl bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
