"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useMantineColorScheme } from "@mantine/core";
import { APP_NAME, APP_TAGLINE } from "@/core/constants";
import { useSupabase } from "@/infrastructure/providers/supabase-provider";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 },
  },
};

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { colorScheme } = useMantineColorScheme();
  const isDark = mounted && colorScheme === "dark";
  const router = useRouter();
  const { supabase } = useSupabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/sign-in?verified=true");
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center w-full max-w-5xl px-5 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="hidden lg:block flex-1 max-w-lg space-y-4 text-center lg:text-left"
      >
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--mantine-color-text)]">
            {APP_NAME}
          </h1>
          <p className="text-xl font-medium text-[var(--mantine-color-dimmed)]">
            {APP_TAGLINE}
          </p>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="text-sm leading-relaxed hidden lg:block text-[var(--mantine-color-dimmed)]"
        >
          Your personal command center for life. Seamlessly manage tasks,
          finances, health, learning, and long-term goals — all in one
          beautifully integrated platform.
        </motion.p>
      </motion.div>

      <motion.div variants={cardVariants} className="w-full max-w-md shrink-0">
        <div
          className="rounded-2xl p-6 sm:p-8 space-y-6"
          style={{
            boxShadow: isDark
              ? "0 8px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06)"
              : "0 8px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
            background: isDark
              ? "rgba(20, 21, 23, 0.6)"
              : "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold text-[var(--mantine-color-text)]">
              Create account
            </h2>
            <p className="text-sm text-[var(--mantine-color-dimmed)]">
              Get started with your life command center
            </p>
          </div>

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--mantine-color-text)]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none"
                style={{
                  border: isDark
                    ? "1px solid rgba(255, 255, 255, 0.08)"
                    : "1px solid #dee2e6",
                  background: isDark
                    ? "rgba(26, 27, 30, 0.8)"
                    : "#f8f9fa",
                  color: isDark ? "#C1C2C5" : "#1A1B1E",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#6366f1";
                  e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "#dee2e6";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--mantine-color-text)]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none"
                style={{
                  border: isDark
                    ? "1px solid rgba(255, 255, 255, 0.08)"
                    : "1px solid #dee2e6",
                  background: isDark
                    ? "rgba(26, 27, 30, 0.8)"
                    : "#f8f9fa",
                  color: isDark ? "#C1C2C5" : "#1A1B1E",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#6366f1";
                  e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "#dee2e6";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full border-t"
                style={{
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "#e9ecef",
                }}
              />
            </div>
            <div className="relative flex justify-center text-xs">
              <span
                className="px-3"
                style={{
                  color: isDark ? "#5C5F66" : "#868e96",
                  background: isDark
                    ? "rgba(20, 21, 23, 0.6)"
                    : "rgba(255, 255, 255, 0.7)",
                }}
              >
                or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full rounded-xl py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              border: isDark
                ? "1px solid rgba(255, 255, 255, 0.08)"
                : "1px solid #e9ecef",
              background: isDark
                ? "rgba(26, 27, 30, 0.6)"
                : "#ffffff",
              color: isDark ? "#FFFFFF" : "#1A1B1E",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <div className="text-center text-sm" style={{ color: isDark ? "#909296" : "#5C5F66" }}>
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium"
              style={{ color: "#6366f1" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
