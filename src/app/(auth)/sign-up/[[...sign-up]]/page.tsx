"use client";

import dynamic from "next/dynamic";
import { dark } from "@clerk/themes";
import { motion } from "framer-motion";
import { useMantineColorScheme } from "@mantine/core";
import { APP_NAME, APP_TAGLINE } from "@/core/constants";

const ClerkSignUp = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.SignUp),
  { ssr: false },
);

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
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1],
      delay: 0.3,
    },
  },
};

export default function SignUpPage() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <motion.div
      className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center w-full max-w-5xl px-5 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Brand Section (hidden on mobile) ── */}
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

      {/* ── Auth Card ── */}
      <motion.div variants={cardVariants} className="w-full max-w-md shrink-0">
        <ClerkSignUp
          appearance={{
            baseTheme: isDark ? dark : undefined,
            variables: {
              colorPrimary: "#6366f1",
              colorBackground: isDark
                ? "rgba(20, 21, 23, 0.6)"
                : "rgba(255, 255, 255, 0.7)",
              colorInputBackground: isDark
                ? "rgba(26, 27, 30, 0.8)"
                : "#f8f9fa",
              colorText: isDark ? "#C1C2C5" : "#1A1B1E",
              colorTextSecondary: isDark ? "#909296" : "#5C5F66",
              colorInputText: isDark ? "#C1C2C5" : "#1A1B1E",
              colorNeutral: isDark ? "#2C2E33" : "#dee2e6",
              borderRadius: "0.75rem",
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: "0.875rem",
            },
            elements: {
              card: {
                boxShadow: isDark
                  ? "0 8px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06)"
                  : "0 8px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                background: isDark
                  ? "rgba(20, 21, 23, 0.6)"
                  : "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderRadius: "1rem",
                border: "none",
              },
              headerTitle: {
                fontSize: "1.25rem",
                fontWeight: "600",
                color: isDark ? "#C1C2C5" : "#1A1B1E",
              },
              headerSubtitle: {
                color: isDark ? "#909296" : "#5C5F66",
              },
              formButtonPrimary: {
                fontSize: "0.875rem",
                fontWeight: "600",
                padding: "0.75rem 1rem",
                background:
                  "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: "0.75rem",
                transition: "all 200ms ease",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
              },
              formButtonPrimaryHover: {
                background:
                  "linear-gradient(135deg, #5558e6, #7c3aed)",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
              },
              footerActionLink: {
                color: "#6366f1",
                fontWeight: "500",
              },
              footerActionText: {
                color: isDark ? "#909296" : "#5C5F66",
              },
              socialButtonsBlockButton: {
                fontSize: "0.875rem",
                fontWeight: "500",
                border: isDark
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid #e9ecef",
                background: isDark
                  ? "rgba(26, 27, 30, 0.6)"
                  : "#ffffff",
                color: isDark ? "#FFFFFF" : "#1A1B1E",
                borderRadius: "0.75rem",
                padding: "0.625rem 1rem",
                transition: "all 200ms ease",
              },
              socialButtonsBlockButtonHover: {
                background: isDark ? "#25262B" : "#f1f3f5",
              },
              dividerLine: {
                background: isDark
                  ? "rgba(255, 255, 255, 0.06)"
                  : "#e9ecef",
              },
              dividerText: {
                color: isDark ? "#5C5F66" : "#868e96",
              },
              formFieldLabel: {
                color: isDark ? "#C1C2C5" : "#1A1B1E",
                fontWeight: "500",
                fontSize: "0.8125rem",
              },
              formFieldInput: {
                borderRadius: "0.75rem",
                border: isDark
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid #dee2e6",
                background: isDark
                  ? "rgba(26, 27, 30, 0.8)"
                  : "#f8f9fa",
                padding: "0.75rem 1rem",
                transition: "all 200ms ease",
                color: isDark ? "#C1C2C5" : "#1A1B1E",
              },
              formFieldInputFocus: {
                borderColor: "#6366f1",
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.15)",
              },
              identityPreviewText: {
                color: isDark ? "#C1C2C5" : "#1A1B1E",
              },
              identityPreviewEditButton: {
                color: "#6366f1",
              },
              otpInputField: {
                borderRadius: "0.75rem",
                border: isDark
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid #dee2e6",
                background: isDark
                  ? "rgba(26, 27, 30, 0.8)"
                  : "#f8f9fa",
                color: isDark ? "#C1C2C5" : "#1A1B1E",
              },
            },
          }}
        />
      </motion.div>
    </motion.div>
  );
}
