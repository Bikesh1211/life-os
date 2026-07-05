"use client";

import { Text, Stack, Box } from "@mantine/core";
import type { JournalEntry } from "@/modules/journal";

type BookPageProps = {
  page:
    | { type: "entry"; date: string; dateLabel: string; entries: JournalEntry[] }
    | { type: "end" }
    | { type: "cover" };
  handwritten?: boolean;
};

export function BookPage({ page, handwritten }: BookPageProps) {
  if (page.type === "cover" || page.type === "end") {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className={`max-w-md ${handwritten ? "font-handwritten" : ""}`}>
          {page.type === "cover" ? (
            <>
              <Text size="xl" fw={700} c="dimmed" className="tracking-widest uppercase">
                My Journal
              </Text>
              <div className="mx-auto my-6 h-px w-16 bg-gray-300 dark:bg-gray-600" />
              <Text size="sm" c="dimmed">
                A collection of thoughts, memories, and reflections
              </Text>
            </>
          ) : (
            <>
              <Text size="xl" fw={700} c="dimmed" className="tracking-widest uppercase">
                The End
              </Text>
              <div className="mx-auto my-6 h-px w-16 bg-gray-300 dark:bg-gray-600" />
              <Text size="sm" c="dimmed">
                ...for now
              </Text>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col p-6 sm:p-8 ${handwritten ? "font-handwritten" : ""}`}>
      <Text
        size="sm"
        c="dimmed"
        className={`mb-4 ${handwritten ? "text-base" : "text-xs"} tracking-wide`}
      >
        {page.dateLabel}
      </Text>
      <div className="mb-4 h-px w-full bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
      <div className="flex-1 overflow-y-auto">
        <Stack gap="lg">
          {page.entries.map((entry) => (
            <div key={entry.id}>
              <Text
                className={`leading-relaxed ${handwritten ? "text-lg" : "text-sm"}`}
                style={{ lineHeight: handwritten ? 1.8 : 1.7 }}
              >
                {entry.title}
              </Text>
              {entry.content && (
                <Text
                  c="dimmed"
                  className={`mt-2 leading-relaxed whitespace-pre-wrap ${handwritten ? "text-base" : "text-sm"}`}
                  style={{ lineHeight: handwritten ? 1.8 : 1.7 }}
                >
                  {entry.content}
                </Text>
              )}
            </div>
          ))}
        </Stack>
      </div>
    </div>
  );
}
