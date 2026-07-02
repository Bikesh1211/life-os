"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

type AuthCardProps = {
  children: ReactNode;
};

export function AuthCard({ children }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-md rounded-2xl border p-8 shadow-2xl backdrop-blur-2xl"
      style={{
        backgroundColor: "var(--mantine-color-body)",
        borderColor: "var(--mantine-color-default-border)",
      }}
    >
      {children}
    </motion.div>
  );
}
