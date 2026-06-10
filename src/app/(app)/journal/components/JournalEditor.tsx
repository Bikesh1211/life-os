"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Modal, TextInput } from "@mantine/core";
import { showSuccess, showError } from "@/core/notifications";
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.currentTarget.value);
    const el = e.currentTarget;
    requestAnimationFrame(() => {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    });
  }

  const handleDelete = useCallback(async () => {
    if (!entryId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/journal/${entryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showSuccess(`"${initialTitle}" has been deleted.`, "Deleted");
      router.push("/journal");
    } catch {
      showError("Failed to delete entry");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
    }
  }, [entryId, initialTitle, router]);

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
      showSuccess(`"${title}" saved successfully.`, entryId ? "Updated" : "Created");
      if (!entryId) {
        router.replace(`/journal/${data.id}`);
      } else {
        router.refresh();
      }
    } catch {
      showError("Failed to save entry");
    } finally {
      setLoading(false);
    }
  }, [title, content, entryId, router]);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-4">
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/journal")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <IconArrowLeft size={16} />
            Back
          </button>
          {entryId && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="cursor-pointer text-xs text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
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

      {entryId && (
        <Modal
            opened={deleteModalOpen}
            onClose={() => { setDeleteModalOpen(false); setConfirmText(""); }}
            title="Delete entry"
            size="sm"
          >
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              This action cannot be undone. Type <strong>{initialTitle}</strong> to confirm.
            </p>
            <TextInput
              value={confirmText}
              onChange={(e) => setConfirmText(e.currentTarget.value)}
              placeholder={initialTitle}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setDeleteModalOpen(false); setConfirmText(""); }}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== initialTitle || deleteLoading}
                className="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-30"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Modal>
      )}
    </div>
  );
}
