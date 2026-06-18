"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function SignInContent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { colorScheme } = useMantineColorScheme();
  const isDark = mounted && colorScheme === "dark";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Read OAuth errors from URL (query params + hash fragment)
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      let errorMsg = `OAuth failed: ${oauthError}`;

      const descFromParam = searchParams.get("error_description");
      if (descFromParam) {
        errorMsg = decodeURIComponent(descFromParam.replace(/\+/g, " "));
      }

      const hash = window.location.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.replace("#", ""));
        const descFromHash = hashParams.get("error_description");
        if (descFromHash) {
          errorMsg = decodeURIComponent(descFromHash.replace(/\+/g, " "));
        }
      }

      setError(errorMsg);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setEmailLoading(false);
      return;
    }

    const redirectTo = searchParams.get("redirect_url") || "/";
    router.push(redirectTo);
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    const redirectTo = searchParams.get("redirect_url") || "/";

    const { data, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?redirect_url=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setGoogleLoading(false);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <motion.div
      className="flex w-full max-w-5xl flex-col items-center gap-10 px-5 py-8 lg:flex-row lg:gap-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="hidden max-w-lg flex-1 space-y-4 text-center lg:block lg:text-left"
      >
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--mantine-color-text)] sm:text-5xl">
            {APP_NAME}
          </h1>
          <p className="text-xl font-medium text-[var(--mantine-color-dimmed)]">{APP_TAGLINE}</p>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="hidden text-sm leading-relaxed text-[var(--mantine-color-dimmed)] lg:block"
        >
          Your personal command center for everything that matters. Organize tasks, goals, health,
          finances, and ideas in one seamless experience.
        </motion.p>
      </motion.div>

      <motion.div variants={cardVariants} className="w-full max-w-md shrink-0">
        <div
          className="space-y-6 rounded-2xl p-6 sm:p-8"
          style={{
            boxShadow: isDark
              ? "0 8px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06)"
              : "0 8px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
            background: isDark ? "rgba(20, 21, 23, 0.6)" : "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-semibold text-[var(--mantine-color-text)]">Sign in</h2>
            <p className="text-sm text-[var(--mantine-color-dimmed)]">Welcome back</p>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--mantine-color-text)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none"
                style={{
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #dee2e6",
                  background: isDark ? "rgba(26, 27, 30, 0.8)" : "#f8f9fa",
                  color: isDark ? "#C1C2C5" : "#1A1B1E",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#6366f1";
                  e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#dee2e6";
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
                placeholder="Your password"
                className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none"
                style={{
                  border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #dee2e6",
                  background: isDark ? "rgba(26, 27, 30, 0.8)" : "#f8f9fa",
                  color: isDark ? "#C1C2C5" : "#1A1B1E",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#6366f1";
                  e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? "rgba(255, 255, 255, 0.08)" : "#dee2e6";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={emailLoading || googleLoading}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
                opacity: emailLoading || googleLoading ? 0.7 : 1,
                cursor: "pointer",
              }}
            >
              {emailLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full border-t"
                style={{
                  borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#e9ecef",
                }}
              />
            </div>
            <div className="relative flex justify-center text-xs">
              <span
                className="px-3"
                style={{
                  color: isDark ? "#5C5F66" : "#868e96",
                  background: isDark ? "rgba(20, 21, 23, 0.6)" : "rgba(255, 255, 255, 0.7)",
                }}
              >
                or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={emailLoading || googleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e9ecef",
              background: isDark ? "rgba(26, 27, 30, 0.6)" : "#ffffff",
              color: isDark ? "#FFFFFF" : "#1A1B1E",
              opacity: googleLoading ? 0.7 : 1,
              cursor: "pointer",
            }}
          >
            {googleLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </>
            )}
          </button>

          <div className="text-center text-sm">
            <Link href="/forgot-password" className="font-medium" style={{ color: "#6366f1" }}>
              Forgot password?
            </Link>
          </div>

          <div className="text-center text-sm" style={{ color: isDark ? "#909296" : "#5C5F66" }}>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-medium" style={{ color: "#6366f1" }}>
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
