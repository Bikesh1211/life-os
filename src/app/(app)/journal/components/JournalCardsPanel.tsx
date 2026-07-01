"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent, type Content } from "@tiptap/react";
import {
  Stack,
  Group,
  Text,
  Paper,
  TextInput,
  ActionIcon,
  Tooltip,
  Badge,
  ScrollArea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconArrowLeft,
  IconSun,
  IconFlame,
  IconStar,
  IconCalendarMonth,
  IconTrash,
  IconCards,
  IconCheck,
  IconAlertCircle,
  IconCloudOff,
} from "@tabler/icons-react";
import { createExtensions, DEFAULT_PLACEHOLDER } from "@/components/editor";
import { textToEditorContent, textFromEditor } from "@/components/editor/utils";
import { EntryCard } from "./EntryCard";
import { Sidebar } from "./Sidebar";
import { JournalDetailPanel } from "./JournalDetailPanel";
import { JournalEditorToolbar } from "./JournalEditorToolbar";
import { computeStreak } from "@/modules/journal/utils";
import { useAutoSave } from "../hooks/useAutoSave";
import type { JournalEntry } from "@/modules/journal";

type Props = {
  entries: JournalEntry[];
  onRefresh: () => void;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function JournalCardsPanel({ entries, onRefresh }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [editorTitle, setEditorTitle] = useState("");
  const [editorContentJson, setEditorContentJson] = useState<Content | undefined>(undefined);
  const [editorContentText, setEditorContentText] = useState("");
  const [editorMood, setEditorMood] = useState<string | null>(null);
  const [editorTags, setEditorTags] = useState<string[]>([]);
  const [editorIsPinned, setEditorIsPinned] = useState(false);
  const [editorIsPrivate, setEditorIsPrivate] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localEntries, setLocalEntries] = useState<JournalEntry[]>(entries);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  const editor = useEditor({
    extensions: useMemo(() => createExtensions(DEFAULT_PLACEHOLDER), []),
    content: editorContentJson ?? { type: "doc", content: [{ type: "paragraph" }] },
    editable: true,
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor: ed }) => {
      const text = ed.getText();
      setEditorContentText(text);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none px-0 py-2 min-h-[200px]",
      },
    },
  });

  useEffect(() => {
    if (editor && editorContentJson !== undefined) {
      const currentJson = editor.getJSON();
      if (JSON.stringify(currentJson) !== JSON.stringify(editorContentJson)) {
        editor.commands.setContent(editorContentJson);
      }
    }
  }, [editor, editorContentJson]);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of localEntries) {
      for (const tag of entry.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return counts;
  }, [localEntries]);

  const filteredEntries = useMemo(() => {
    let filtered = [...localEntries];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.content ?? "").toLowerCase().includes(q),
      );
    }

    if (activeFilter === "pinned") {
      filtered = filtered.filter((e) => e.isPinned);
    } else if (activeFilter === "private") {
      filtered = filtered.filter((e) => e.isPrivate);
    }

    if (selectedTag) {
      filtered = filtered.filter((e) => (e.tags ?? []).includes(selectedTag));
    }

    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aDate = a.eventDate ?? a.createdAt;
      const bDate = b.eventDate ?? b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
  }, [localEntries, searchQuery, activeFilter, selectedTag]);

  const selectedEntry = useMemo(() => {
    if (!selectedEntryId) return null;
    return localEntries.find((e) => e.id === selectedEntryId) ?? null;
  }, [selectedEntryId, localEntries]);

  const streak = useMemo(
    () =>
      computeStreak(
        localEntries.map((e) => new Date(e.eventDate ?? e.createdAt)),
      ),
    [localEntries],
  );

  const thisMonthCount = useMemo(
    () =>
      localEntries.filter((e) => {
        const d = new Date(e.eventDate ?? e.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
    [localEntries],
  );

  const pinnedCount = localEntries.filter((e) => e.isPinned).length;

  const handleNewJournal = useCallback(() => {
    setIsCreating(true);
    setSelectedEntryId(null);
    setEditorTitle("");
    setEditorContentJson({ type: "doc", content: [{ type: "paragraph" }] });
    setEditorContentText("");
    setEditorMood(null);
    setEditorTags([]);
    setEditorIsPinned(false);
    setEditorIsPrivate(true);
    setShowDetail(false);
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []);

  const handleSelectEntry = useCallback(
    (entry: JournalEntry) => {
      setIsCreating(false);
      setSelectedEntryId(entry.id);
      setEditorTitle(entry.title);
      const json = textToEditorContent(entry.content) as Content;
      setEditorContentJson(json);
      setEditorContentText(entry.content ?? "");
      setEditorMood(entry.mood ?? null);
      setEditorTags(entry.tags ?? []);
      setEditorIsPinned(entry.isPinned);
      setEditorIsPrivate(entry.isPrivate);
      setShowDetail(true);
      setTimeout(() => titleRef.current?.focus(), 100);
    },
    [],
  );

  const handleBack = useCallback(() => {
    if (autoSaveStatus === "saving") {
      saveNow();
    }
    setIsCreating(false);
    setSelectedEntryId(null);
    setShowDetail(false);
  }, []);

  const handleAutoSave = useCallback(async () => {
    if (!editorTitle.trim() || !selectedEntryId) return;
    const body: Record<string, unknown> = {
      title: editorTitle,
      content: editorContentText,
      tags: editorTags,
      isPinned: editorIsPinned,
      isPrivate: editorIsPrivate,
    };
    if (editorMood) body.mood = editorMood;
    const res = await fetch(`/api/journal/${selectedEntryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Autosave failed");
    const updated: JournalEntry = await res.json();
    setLocalEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }, [editorTitle, editorContentText, editorMood, editorTags, editorIsPinned, editorIsPrivate, selectedEntryId]);

  const { status: autoSaveStatus, scheduleSave, saveNow } = useAutoSave({ onSave: handleAutoSave, debounceMs: 3000 });

  useEffect(() => {
    if ((isCreating || selectedEntryId) && editorTitle.trim()) {
      scheduleSave();
    }
  }, [editorTitle, editorContentText, editorTags, editorMood, scheduleSave, isCreating, selectedEntryId]);

  const handleSave = useCallback(async () => {
    if (!editorTitle.trim()) {
      notifications.show({
        title: "Missing title",
        message: "Please add a title before saving.",
        color: "yellow",
      });
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: editorTitle,
        content: editorContentText,
        tags: editorTags,
        isPinned: editorIsPinned,
        isPrivate: editorIsPrivate,
      };
      if (editorMood) body.mood = editorMood;

      if (selectedEntryId) {
        const res = await fetch(`/api/journal/${selectedEntryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update");
        const updated: JournalEntry = await res.json();
        setLocalEntries((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e)),
        );
        notifications.show({ title: "Saved", message: "Entry updated.", color: "green" });
      } else {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create");
        const created: JournalEntry = await res.json();
        setLocalEntries((prev) => [created, ...prev]);
        setSelectedEntryId(created.id);
        setIsCreating(false);
        setShowDetail(true);
        notifications.show({ title: "Created", message: "New entry saved.", color: "green" });
      }
      onRefresh();
    } catch {
      notifications.show({ title: "Error", message: "Failed to save entry.", color: "red" });
    } finally {
      setSaving(false);
    }
  }, [
    editorTitle,
    editorContentText,
    editorMood,
    editorTags,
    editorIsPinned,
    editorIsPrivate,
    selectedEntryId,
    onRefresh,
  ]);

  const handleDelete = useCallback(async () => {
    if (!selectedEntryId) return;
    if (!window.confirm("Delete this entry?")) return;
    try {
      const res = await fetch(`/api/journal/${selectedEntryId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setLocalEntries((prev) => prev.filter((e) => e.id !== selectedEntryId));
      handleBack();
      notifications.show({ title: "Deleted", message: "Entry deleted.", color: "orange" });
      onRefresh();
    } catch {
      notifications.show({ title: "Error", message: "Failed to delete entry.", color: "red" });
    }
  }, [selectedEntryId, handleBack, onRefresh]);

  const isEditing = isCreating || !!selectedEntryId;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <Text size="xl" fw={700}>
          {getGreeting()} 👋
        </Text>
        <Text size="sm" c="dimmed">
          {isEditing ? "Write your thoughts..." : "Continue writing your memories."}
        </Text>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-3">
        <StatCard
          icon={<IconSun size={16} />}
          label="Total Journals"
          value={localEntries.length}
          color="blue"
        />
        <StatCard
          icon={<IconFlame size={16} />}
          label="Streak"
          value={`${streak}d`}
          color="orange"
        />
        <StatCard
          icon={<IconCalendarMonth size={16} />}
          label="This Month"
          value={thisMonthCount}
          color="violet"
        />
        <StatCard
          icon={<IconStar size={16} />}
          label="Favorites"
          value={pinnedCount}
          color="yellow"
        />
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="hidden w-56 shrink-0 md:block">
          <Sidebar
            entries={localEntries}
            tagCounts={tagCounts}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFilterChange={(f) => {
              setActiveFilter(f);
              setSelectedTag(null);
            }}
            onTagClick={(tag) => {
              setSelectedTag(selectedTag === tag ? null : tag);
              setActiveFilter("all");
            }}
            selectedTag={selectedTag}
            onNewJournal={handleNewJournal}
          />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {!isEditing ? (
            <div className="flex h-full flex-col overflow-hidden">
              <Group justify="space-between" mb="sm">
                <Text size="sm" fw={600} c="dimmed">
                  {filteredEntries.length}{" "}
                  {filteredEntries.length === 1 ? "entry" : "entries"}
                  {selectedTag && (
                    <Badge size="sm" variant="light" ml="xs">
                      #{selectedTag}
                    </Badge>
                  )}
                </Text>
                <ActionIcon
                  variant="light"
                  color="blue"
                  size="lg"
                  radius="xl"
                  onClick={handleNewJournal}
                >
                  <IconPlus size={18} />
                </ActionIcon>
              </Group>
              <ScrollArea className="flex-1 pr-2">
                <Stack gap="sm">
                  {filteredEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <IconCards size={48} stroke={1.5} className="mb-4 opacity-40" />
                      <Text size="sm">
                        {searchQuery || selectedTag
                          ? "No matching entries."
                          : "No entries yet. Create your first one!"}
                      </Text>
                    </div>
                  ) : (
                    filteredEntries.map((entry) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        isSelected={selectedEntryId === entry.id}
                        onSelect={() => handleSelectEntry(entry)}
                      />
                    ))
                  )}
                </Stack>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <Group justify="space-between" mb="sm">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <IconArrowLeft size={16} />
                  Back
                </button>
                <Group gap="xs">
                  <Tooltip label="Delete" withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={handleDelete}
                      disabled={!selectedEntryId}
                    >
                      <IconTrash size={15} />
                    </ActionIcon>
                  </Tooltip>
                  {selectedEntryId && autoSaveStatus !== "idle" && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      {autoSaveStatus === "saving" && <IconCloudOff size={12} className="animate-pulse" />}
                      {autoSaveStatus === "saved" && <IconCheck size={12} className="text-green-500" />}
                      {autoSaveStatus === "error" && <IconAlertCircle size={12} className="text-red-500" />}
                      {autoSaveStatus === "saving" && "Saving..."}
                      {autoSaveStatus === "saved" && "Saved"}
                      {autoSaveStatus === "error" && "Save failed"}
                    </div>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : selectedEntryId ? "Update" : "Save"}
                  </button>
                </Group>
              </Group>

              <TextInput
                ref={titleRef}
                value={editorTitle}
                onChange={(e) => setEditorTitle(e.currentTarget.value)}
                placeholder="Title"
                variant="unstyled"
                size="xl"
                className="mb-2 font-bold"
                styles={{
                  input: {
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    padding: 0,
                    height: "auto",
                  },
                }}
              />

              {editor && (
                <div className="mb-3">
                  <JournalEditorToolbar editor={editor} />
                </div>
              )}

              <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-[var(--mantine-color-dark-7)]">
                <EditorContent editor={editor} />
              </div>
            </div>
          )}
        </div>

        {showDetail && (isCreating || selectedEntry) && (
          <div className="hidden w-72 shrink-0 xl:block">
            <ScrollArea className="h-full">
              <JournalDetailPanel
                entry={{
                  ...(selectedEntry ?? {}),
                  title: editorTitle,
                  content: editorContentText,
                  tags: editorTags,
                  isPinned: editorIsPinned,
                  isPrivate: editorIsPrivate,
                  createdAt: selectedEntry?.createdAt ?? new Date(),
                  updatedAt: selectedEntry?.updatedAt ?? new Date(),
                }}
                isEditing={true}
                onMoodChange={(mood) => setEditorMood(mood)}
                onTagsChange={setEditorTags}
                onPinToggle={() => setEditorIsPinned((p) => !p)}
                onPrivacyToggle={() => setEditorIsPrivate((p) => !p)}
              />
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color: _color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Paper
      withBorder
      p="sm"
      radius="lg"
      className="flex items-center gap-3 border-gray-200 bg-white dark:border-gray-700 dark:bg-[var(--mantine-color-dark-7)]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
        {icon}
      </div>
      <div>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        <Text fw={700} size="lg">
          {value}
        </Text>
      </div>
    </Paper>
  );
}
