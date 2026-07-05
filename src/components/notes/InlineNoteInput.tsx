"use client";

import { useState, useRef, useEffect } from "react";
import { Group, ActionIcon, Tooltip } from "@mantine/core";
import { IconColorPicker } from "@tabler/icons-react";
import { useCreateNote, useNoteTags } from "@/hooks/use-notes";
import { useNotesStore } from "@/stores/notes-store";

const NOTE_COLORS = [
  { value: null, label: "Default", className: "bg-white dark:bg-[#1c1c2b] border border-gray-300 dark:border-gray-600" },
  { value: "red", label: "Red", className: "bg-[#f28b82]" },
  { value: "orange", label: "Orange", className: "bg-[#fbbc04]" },
  { value: "yellow", label: "Yellow", className: "bg-[#fff475]" },
  { value: "green", label: "Green", className: "bg-[#ccff90]" },
  { value: "teal", label: "Teal", className: "bg-[#a7ffeb]" },
  { value: "blue", label: "Blue", className: "bg-[#cbf0f8]" },
  { value: "purple", label: "Purple", className: "bg-[#d7aefb]" },
  { value: "pink", label: "Pink", className: "bg-[#fdcfe8]" },
  { value: "brown", label: "Brown", className: "bg-[#e6c9a8]" },
  { value: "gray", label: "Gray", className: "bg-[#e8eaed]" },
];

export function InlineNoteInput() {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const createNote = useCreateNote();
  const { data: tags } = useNoteTags();
  const openCreateModal = useNotesStore((s) => s.openCreateModal);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (title || content) handleSave();
        else reset();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [title, content, color]);

  function reset() {
    setTitle("");
    setContent("");
    setExpanded(false);
    setShowColorPicker(false);
    setShowTagPicker(false);
  }

  function handleSave() {
    const t = title.trim() || "Untitled";
    const c = content.trim();
    if (!c && t === "Untitled") { reset(); return; }
    createNote.mutate({ title: t, content: c, color: color ?? undefined });
    reset();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") reset();
  }

  return (
    <div ref={containerRef} className="mb-6">
      <div
        className={`rounded-xl border border-[var(--border-subtle)] transition-all ${
          expanded ? "shadow-md" : "hover:shadow-sm"
        }`}
        style={{ backgroundColor: color ? NOTE_COLORS.find((c) => c.value === color)?.className.split(" ")[0] || undefined : "var(--mantine-color-body)" }}
      >
        {!expanded ? (
          <div
            className="px-4 py-3 cursor-text text-sm text-gray-500"
            onClick={() => setExpanded(true)}
          >
            Take a note...
          </div>
        ) : (
          <div className="p-4">
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-sm font-semibold mb-2 placeholder-gray-400"
              style={{ color: "inherit" }}
            />
            <textarea
              ref={inputRef}
              placeholder="Take a note..."
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className="w-full bg-transparent outline-none resize-none text-sm placeholder-gray-400"
              style={{ color: "inherit" }}
            />

            {/* Color picker */}
            {showColorPicker && (
              <Group gap={4} mt={8} wrap="wrap">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.value ?? "default"}
                    onClick={() => setColor(c.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      color === c.value ? "border-blue-500 scale-110" : "border-transparent hover:scale-110"
                    } ${c.className}`}
                    title={c.label}
                  />
                ))}
              </Group>
            )}

            {/* Tag picker */}
            {showTagPicker && tags && tags.length > 0 && (
              <Group gap={4} mt={8} wrap="wrap">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    className="text-xs px-2 py-0.5 rounded-full border border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {tag.name}
                  </button>
                ))}
              </Group>
            )}

            {/* Action bar */}
            <Group justify="space-between" mt={8}>
              <Group gap={2}>
                <Tooltip label="Color">
                  <ActionIcon
                    variant={showColorPicker ? "filled" : "subtle"}
                    size="sm"
                    onClick={() => { setShowColorPicker(!showColorPicker); setShowTagPicker(false); }}
                  >
                    <IconColorPicker size={14} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="More (open full editor)">
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={() => {
                      if (title.trim() || content.trim()) {
                        createNote.mutate({
                          title: title.trim() || "Untitled",
                          content: content.trim(),
                          color: color ?? undefined,
                        }, { onSuccess: () => openCreateModal() });
                      } else {
                        openCreateModal();
                      }
                      reset();
                    }}
                  >
                    <IconColorPicker size={14} style={{ transform: "rotate(90deg)" }} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Group gap={4}>
                {color && (
                  <span
                    className="w-4 h-4 rounded-full inline-block"
                    style={{ backgroundColor: NOTE_COLORS.find((c) => c.value === color)?.className.split(" ")[0] || "#ccc" }}
                  />
                )}
                <button
                  onClick={handleSave}
                  disabled={createNote.isPending}
                  className="text-xs px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {createNote.isPending ? "Saving..." : "Done"}
                </button>
              </Group>
            </Group>
          </div>
        )}
      </div>
    </div>
  );
}
