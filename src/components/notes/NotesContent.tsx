"use client";

import { useMemo } from "react";
import {
  TextInput,
  Group,
  ActionIcon,
  Tooltip,
  Text,
  Drawer,
  ScrollArea,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch, IconMenu2, IconPlus } from "@tabler/icons-react";
import { useHotkeys } from "@mantine/hooks";
import { NoteCard } from "./NoteCard";
import { NotesSidebar } from "./NotesSidebar";
import { InlineNoteInput } from "./InlineNoteInput";
import { NoteEditModal } from "./NoteEditModal";
import { useNotes } from "@/hooks/use-notes";
import { useNotesStore } from "@/stores/notes-store";
import type { Note } from "@/modules/notes";

type NotesContentProps = {
  initialNotes: Note[];
};

export function NotesContent({ initialNotes }: NotesContentProps) {
  const {
    search,
    setSearch,
    sidebarView,
    activeLabel,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openCreateModal,
  } = useNotesStore();

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  const { data: notesData } = useNotes({}, initialNotes);
  const safeNotes = notesData ?? initialNotes;

  useHotkeys([["mod+Shift+N", () => openCreateModal()]]);

  const filtered = useMemo(() => {
    let result = [...safeNotes];

    // Filter by sidebar view
    if (sidebarView === "archive") {
      result = result.filter((n) => n.status === "archived");
    } else if (sidebarView === "trash") {
      result = result.filter((n) => n.deletedAt);
    } else if (sidebarView === "reminders") {
      result = result.filter((n) => n.reminderDate);
    } else {
      result = result.filter((n) => !n.deletedAt && n.status !== "archived");
    }

    // Filter by label
    if (activeLabel) {
      result = result.filter((n) => n.tags?.includes(activeLabel));
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.content ?? "").toLowerCase().includes(q),
      );
    }

    return result;
  }, [safeNotes, search, sidebarView, activeLabel]);

  const pinnedNotes = useMemo(() => filtered.filter((n) => n.isPinned), [filtered]);
  const unpinnedNotes = useMemo(() => filtered.filter((n) => !n.isPinned), [filtered]);

  const heading =
    sidebarView === "reminders" ? "Reminders" :
    sidebarView === "archive" ? "Archive" :
    sidebarView === "trash" ? "Trash" :
    activeLabel ? `Label: ${activeLabel}` :
    "Notes";

  const isEmpty = pinnedNotes.length === 0 && unpinnedNotes.length === 0;

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <Box visibleFrom="md" className="h-full">
        <NotesSidebar />
      </Box>

      {/* Mobile drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size={240}
        padding={0}
        withCloseButton={false}
      >
        <NotesSidebar />
      </Drawer>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          {/* Header row */}
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <Box className="md:hidden">
                <ActionIcon variant="subtle" size="md" onClick={openDrawer}>
                  <IconMenu2 size={18} />
                </ActionIcon>
              </Box>
              <Text size="xl" fw={700}>{heading}</Text>
            </Group>
            <Group gap="xs">
              <ActionIcon variant="subtle" size="md" onClick={toggleSidebar}>
                <IconMenu2 size={18} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                size="md"
                radius="md"
                onClick={openCreateModal}
              >
                <IconPlus size={18} />
              </ActionIcon>
            </Group>
          </Group>

          {/* Single search bar */}
          <TextInput
            placeholder="Search notes..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="sm"
            mb="md"
          />

          {/* Inline "Take a note..." bar */}
          {sidebarView === "notes" && !activeLabel && <InlineNoteInput />}

          {/* Masonry grid */}
          <ScrollArea className="flex-1 -mx-4 sm:-mx-6 px-4 sm:px-6">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Text size="sm" c="dimmed">
                  {search
                    ? "No notes match your search"
                    : sidebarView === "archive"
                      ? "No archived notes"
                      : sidebarView === "trash"
                        ? "Trash is empty"
                        : sidebarView === "reminders"
                          ? "No reminders"
                          : "No notes yet. Take one above!"}
                </Text>
              </div>
            ) : (
              <>
                {pinnedNotes.length > 0 && (
                  <>
                    <Text size="xs" fw={600} c="dimmed" mb="sm" tt="uppercase">
                      Pinned
                    </Text>
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 mb-8">
                      {pinnedNotes.map((note) => (
                        <NoteCard key={note.id} note={note} />
                      ))}
                    </div>
                  </>
                )}
                {unpinnedNotes.length > 0 && (
                  <>
                    {pinnedNotes.length > 0 && (
                      <Text size="xs" fw={600} c="dimmed" mb="sm" tt="uppercase">
                        Other notes
                      </Text>
                    )}
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                      {unpinnedNotes.map((note) => (
                        <NoteCard key={note.id} note={note} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </ScrollArea>
        </div>
      </div>

      <NoteEditModal />
    </div>
  );
}
