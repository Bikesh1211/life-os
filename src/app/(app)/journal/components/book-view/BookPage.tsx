"use client";

import { Text } from "@mantine/core";
import type { CSSProperties } from "react";
import type { BookPage as BookPageType } from "./useBookData";

export type ReaderTheme = "light" | "sepia" | "dark" | "oled" | "paper" | "cream";

export const READER_THEMES: Record<ReaderTheme, { bg: string; text: string; muted: string; border: string }> = {
  light: { bg: "#ffffff", text: "#1a1a1a", muted: "#6b7280", border: "#e5e7eb" },
  sepia: { bg: "#f5e6c8", text: "#5b4636", muted: "#8b7355", border: "#d4c5a9" },
  dark: { bg: "#1a1a2e", text: "#e0e0e0", muted: "#9ca3af", border: "#2d2d44" },
  oled: { bg: "#000000", text: "#e0e0e0", muted: "#6b7280", border: "#1f1f1f" },
  paper: { bg: "#f0ece4", text: "#3d3229", muted: "#8b7d6b", border: "#ddd6c8" },
  cream: { bg: "#faf3e0", text: "#4a3b32", muted: "#8b7d6b", border: "#e8dcc8" },
};

type BookPageProps = {
  page: BookPageType;
  theme: ReaderTheme;
  fontSize: number;
  lineHeight: number;
  pageWidth: number;
  fontFamily: string;
};

export function BookPage({ page, theme, fontSize, lineHeight, pageWidth, fontFamily }: BookPageProps) {
  const colors = READER_THEMES[theme];

  if (page.type === "empty") {
    return (
      <div className="flex h-full items-center justify-center p-12 text-center">
        <Text size="sm" c="dimmed">
          No journal entries yet. Start writing to fill these pages.
        </Text>
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex h-full w-full flex-col px-6 py-10 sm:px-10 sm:py-14"
      style={{
        maxWidth: pageWidth,
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      <Text
        size="sm"
        className="mb-2 tracking-wide"
        style={{ color: colors.muted, fontSize: fontSize - 4 }}
      >
        {page.dateLabel}
      </Text>
      <div
        className="mb-6 h-px"
        style={{
          background: `linear-gradient(to right, ${colors.border}, ${colors.border}88, transparent)`,
        }}
      />
      <div
        className="reader-scroll -mr-2 flex-1 space-y-6 overflow-y-auto pr-1"
        style={{ "--reader-scroll-tint": colors.muted } as CSSProperties}
      >
        {page.entries.map((entry) => (
          <article key={entry.id}>
            <Text
              style={{
                fontFamily,
                fontSize: fontSize + 6,
                lineHeight,
                fontWeight: 600,
                color: colors.text,
              }}
            >
              {entry.title}
            </Text>
            {entry.content && (
              <Text
                style={{
                  fontFamily,
                  fontSize,
                  lineHeight,
                  marginTop: 8,
                  whiteSpace: "pre-wrap",
                  color: colors.text,
                }}
              >
                {entry.content}
              </Text>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
