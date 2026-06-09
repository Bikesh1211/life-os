"use client";

import { motion } from "framer-motion";

type StatCardProps = {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  delay?: number;
};

export function StatCard({ value, label, icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="rounded-xl border border-[var(--mantine-color-dark-4,#2e2f33)] bg-[var(--mantine-color-body,#0a0a0f)] p-4 transition-colors hover:border-[var(--mantine-color-dark-3,#373a40)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-3xl">
            {value}
          </p>
          <p className="mt-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)]">
            {label}
          </p>
        </div>
        {icon && (
          <div className="text-[var(--mantine-color-dimmed,#5c5f66)]">{icon}</div>
        )}
      </div>
      {trend && (
        <p
          className={`mt-2 text-xs ${
            trend.positive ? "text-green-400" : "text-red-400"
          }`}
        >
          {trend.positive ? "↑" : "↓"} {trend.value}
        </p>
      )}
    </motion.div>
  );
}
