"use client";

import { motion } from "framer-motion";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

type SectionHeadingProps = {
  title: string;
  action?: { label: string; href: string };
};

export function SectionHeading({ title, action }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-4 flex items-center justify-between"
    >
      <h2 className="text-xl font-bold text-[var(--mantine-color-text,#c1c2c5)] sm:text-2xl">
        {title}
      </h2>
      {action && (
        <Link
          href={action.href}
          className="group flex items-center gap-1 text-sm text-[var(--mantine-color-dimmed,#5c5f66)] transition-colors hover:text-white"
        >
          {action.label}
          <IconChevronRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </motion.div>
  );
}
