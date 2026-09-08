"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useMantineColorScheme } from "@mantine/core";

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

function ResetPasswordForm() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { colorScheme } = useMantineColorScheme();
  const isDark = mounted && colorScheme === "dark";
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!token) {
      setError("Invalid reset link");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, token }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update password");
        setLoading(false);
        return;
      }

      router.push("/sign-in?reset=true");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-5">
      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="w-full max-w-md">
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
              Set new password
            </h2>
            <p className="text-sm text-[var(--mantine-color-dimmed)]">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--mantine-color-text)]">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your new password"
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
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-[var(--mantine-color-dimmed)]">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
