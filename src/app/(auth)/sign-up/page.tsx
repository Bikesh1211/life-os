"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/core/constants";
import { AuthCard } from "../_components/AuthCard";
import { AuthInput } from "../_components/AuthInput";
import { AuthButton } from "../_components/AuthButton";

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [email, password, fullName, router]);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="flex w-full max-w-5xl flex-col items-center gap-12 px-5 py-8 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="hidden flex-1 space-y-4 lg:block">
        <motion.div variants={fadeUp}>
          <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-base font-bold text-white shadow-lg shadow-blue-500/20">
            {APP_NAME.charAt(0)}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--mantine-color-text)] sm:text-5xl">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-xl font-medium text-[var(--mantine-color-dimmed)]">
            {APP_TAGLINE}
          </p>
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="max-w-md text-sm leading-relaxed text-[var(--mantine-color-dimmed)]"
        >
          Your personal command center for everything that matters. Organize tasks, goals, health,
          finances, and ideas in one seamless experience.
        </motion.p>
      </div>

      <AuthCard>
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[var(--mantine-color-text)]">Create account</h2>
            <p className="text-sm text-[var(--mantine-color-dimmed)]">
              Get started with your life command center.
            </p>
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <AuthInput
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              autoFocus
              required
            />

            <AuthInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <AuthInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <AuthButton type="submit" loading={loading}>
              Create account
            </AuthButton>
          </form>

          <p className="text-center text-sm text-[var(--mantine-color-dimmed)]">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-blue-500 transition-colors hover:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </AuthCard>
    </motion.div>
  );
}
