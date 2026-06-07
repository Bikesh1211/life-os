"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { JournalEditor } from "../components/JournalEditor";

export default function NewJournalEntryPage() {
  const router = useRouter();

  const handleSave = useCallback(
    async (data: { title: string; content: string; mood?: string; tags?: string[]; reflectionScore?: number }) => {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      const entry = await res.json();
      router.replace(`/journal/${entry.id}`);
    },
    [router],
  );

  return <JournalEditor onSave={handleSave} />;
}
