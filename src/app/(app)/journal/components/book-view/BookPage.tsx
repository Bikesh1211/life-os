"use client";

import { Text } from "@mantine/core";
import type { BookPage as BookPageType } from "./useBookData";

type BookPageProps = {
  page: BookPageType;
};

export function BookPage({ page }: BookPageProps) {
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
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col px-6 py-10 sm:px-10 sm:py-14">
      <Text size="sm" c="dimmed" className="mb-2 tracking-wide">
        {page.dateLabel}
      </Text>
      <div className="mb-6 h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent dark:from-gray-700 dark:via-gray-800" />
      <div className="flex-1 space-y-6 overflow-y-auto">
        {page.entries.map((entry) => (
          <article key={entry.id}>
            <Text
              size="lg"
              fw={600}
              className="leading-relaxed text-gray-900 dark:text-gray-100"
            >
              {entry.title}
            </Text>
            {entry.content && (
              <Text
                size="sm"
                className="mt-2 leading-relaxed whitespace-pre-wrap text-gray-600 dark:text-gray-400"
                style={{ lineHeight: 1.8 }}
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
