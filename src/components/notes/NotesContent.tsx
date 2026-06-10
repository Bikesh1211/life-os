"use client";

import { useState, useMemo } from "react";
import {
  Stack,
  Group,
  TextInput,
  ActionIcon,
  Tooltip,
  Text,
  Paper,
  SimpleGrid,
  SegmentedControl,
  ScrollArea,
  Modal,
  Button,
} from "@mantine/core";
import {
  IconSearch,
  IconLayoutGrid,
  IconList,
  IconPlus,
  IconArchive,
  IconArchiveOff,
  IconTrash,
} from "@tabler/icons-react";
import { useHotkeys } from "@mantine/hooks";
import { NoteCard } from "./NoteCard";
import { QuickNoteModal } from "./QuickNoteModal";
import { useNotes, useNoteTags, useDeleteNote } from "@/hooks/use-notes";
import { useNotesStore } from "@/stores/notes-store";
import type { Note } from "@/modules/notes";

const categories = ["all", "personal", "work", "study", "ideas", "journal"] as const;

type NotesContentProps = {
  initialNotes: Note[];
};

export function NotesContent({ initialNotes }: NotesContentProps) {
  const {
    viewMode,
    setViewMode,
    search,
    setSearch,
    selectedTags,
    toggleTag,
    categoryFilter,
    setCategoryFilter,
    showArchived,
    setShowArchived,
    openQuickNote,
  } = useNotesStore();
  const { data: notesData } = useNotes({
    search: search || undefined,
    category: categoryFilter === "all" ? undefined : categoryFilter ?? undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    isArchived: showArchived || undefined,
  }, initialNotes);
  const { data: tagDefinitions } = useNoteTags();
  const deleteNote = useDeleteNote();
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const safeNotes = notesData ?? initialNotes;

  useHotkeys([["mod+Shift+N", () => openQuickNote()]]);

  const pinnedNotes = useMemo(() => safeNotes.filter((n) => n.isPinned), [safeNotes]);
  const unpinnedNotes = useMemo(() => safeNotes.filter((n) => !n.isPinned), [safeNotes]);

  function renderNoteCard(note: Note) {
    return <NoteCard key={note.id} note={note} onDeleteRequest={setDeletingNote} />;
  }

  return (
    <>
      <Stack gap="md" className="h-full">
        <Group justify="space-between">
          <Text size="xl" fw={700}>
            Notes
          </Text>
          <Tooltip label="New Note (⌘⇧N)">
            <ActionIcon variant="filled" size="lg" radius="md" onClick={openQuickNote}>
              <IconPlus size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>

        <Group gap="sm">
          <TextInput
            placeholder="Search notes..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className="flex-1"
            size="sm"
          />
          <SegmentedControl
            data={[
              { value: "grid", label: <IconLayoutGrid size={16} /> },
              { value: "list", label: <IconList size={16} /> },
            ]}
            value={viewMode}
            onChange={(v) => setViewMode(v as "grid" | "list")}
            size="xs"
          />
          <Tooltip label={showArchived ? "Hide archived" : "Show archived"}>
            <ActionIcon
              variant={showArchived ? "filled" : "subtle"}
              size="md"
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? <IconArchiveOff size={16} /> : <IconArchive size={16} />}
            </ActionIcon>
          </Tooltip>
        </Group>

        <Group gap={4} wrap="wrap">
          {categories.map((cat) => (
            <Paper
              key={cat}
              withBorder
              px="sm"
              py={3}
              className={`text-sm cursor-pointer transition-colors ${
                categoryFilter === cat || (cat === "all" && !categoryFilter)
                  ? "bg-blue-500 text-white border-blue-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              radius="xl"
              onClick={() => setCategoryFilter(cat === "all" ? null : cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Paper>
          ))}
        </Group>

        {tagDefinitions && tagDefinitions.length > 0 && (
          <Group gap={4} wrap="wrap">
            {tagDefinitions.map((tag) => (
              <Paper
                key={tag.id}
                withBorder
                px="sm"
                py={3}
                className={`text-sm cursor-pointer transition-colors ${
                  selectedTags.includes(tag.name)
                    ? "ring-2 ring-offset-1"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                radius="xl"
                style={{
                  borderColor: selectedTags.includes(tag.name) ? tag.color : undefined,
                  backgroundColor: selectedTags.includes(tag.name) ? `${tag.color}20` : undefined,
                }}
                onClick={() => toggleTag(tag.name)}
              >
                {tag.name}
              </Paper>
            ))}
          </Group>
        )}

        <ScrollArea className="flex-1 -mx-6 px-6">
          {safeNotes.length === 0 ? (
            <Paper withBorder p="xl" className="text-center">
              <Text c="dimmed">
                {search || selectedTags.length > 0 || categoryFilter
                  ? "No notes match your filters"
                  : showArchived
                    ? "No archived notes"
                    : "No notes yet. Create your first note!"}
              </Text>
            </Paper>
          ) : viewMode === "grid" ? (
            <>
              {pinnedNotes.length > 0 && (
                <>
                  <Text size="sm" fw={500} c="dimmed" mb="xs">
                    Pinned
                  </Text>
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mb="lg">
                    {pinnedNotes.map(renderNoteCard)}
                  </SimpleGrid>
                </>
              )}
              {unpinnedNotes.length > 0 && (
                <>
                  {pinnedNotes.length > 0 && (
                    <Text size="sm" fw={500} c="dimmed" mb="xs">
                      All Notes
                    </Text>
                  )}
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {unpinnedNotes.map(renderNoteCard)}
                  </SimpleGrid>
                </>
              )}
            </>
          ) : (
            <Stack gap="xs">
              {pinnedNotes.map(renderNoteCard)}
              {unpinnedNotes.map(renderNoteCard)}
            </Stack>
          )}
        </ScrollArea>
      </Stack>

      <QuickNoteModal />

      <Modal
        opened={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        title="Delete note"
        size="sm"
        centered
      >
        <Text size="sm" mb="lg">
          Are you sure you want to delete <strong>{deletingNote?.title}</strong>? This action cannot be undone.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={() => setDeletingNote(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={deleteNote.isPending}
            onClick={() =>
              deletingNote &&
              deleteNote.mutate(deletingNote.id, {
                onSuccess: () => setDeletingNote(null),
              })
            }
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}
