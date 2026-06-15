"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft } from "@tabler/icons-react";

type JournalEditorProps = {
  initialTitle?: string;
  initialContent?: string;
  entryId?: string;
};

export function JournalEditor({
  initialTitle = "",
  initialContent = "",
  entryId,
}: JournalEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.currentTarget.value);
    const el = e.currentTarget;
    requestAnimationFrame(() => {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    });
  }

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      const url = entryId ? `/api/journal/${entryId}` : "/api/journal";
      const method = entryId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      notifications.show({
        title: entryId ? "Updated" : "Created",
        message: `"${title}" saved successfully.`,
        color: "green",
      });
      if (!entryId) {
        router.replace(`/journal/${data.id}`);
      } else {
        router.refresh();
      }
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to save entry",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [title, content, entryId, router]);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-4">
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => router.push("/journal")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <IconArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="cursor-pointer rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : entryId ? "Update" : "Save"}
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        placeholder="Title"
        className="w-full border-0 bg-transparent text-2xl font-bold outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
        autoFocus
      />

      <div className="my-3 h-px bg-gray-200 dark:bg-gray-700" />

      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        placeholder="Write your thoughts..."
        className="w-full flex-1 resize-none border-0 bg-transparent text-base leading-relaxed outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
        style={{ minHeight: "360px" }}
      />
    </div>
  );
}
