"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "../design-system/SectionHeading";

type Goal = {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
};

function ProgressRing({ current, target, label }: { current: number; target: number; label: string }) {
  const pct = Math.min((current / target) * 100, 100);
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-[var(--mantine-color-dark-4,#2e2f33)]" />
          <motion.circle
            cx="40" cy="40" r={r}
            fill="none" stroke="currentColor" strokeWidth="4"
            strokeLinecap="round"
            className="text-blue-400"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-[var(--mantine-color-text,#c1c2c5)]">
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <p className="text-center text-xs text-[var(--mantine-color-dimmed,#5c5f66)]">
        {current}/{target} {label}
      </p>
    </div>
  );
}

export function GoalsProgress({ goals }: { goals?: Goal[] }) {
  if (!goals || goals.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Goals Progress" action={{ label: "Manage", href: "/music/goals" }} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {goals.map((goal, i) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4"
          >
            <ProgressRing current={goal.current} target={goal.target} label={goal.unit} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
