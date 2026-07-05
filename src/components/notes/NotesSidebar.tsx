"use client";

import { Text, Stack, NavLink, ScrollArea, Paper, Group } from "@mantine/core";
import {
  IconBulb,
  IconBell,
  IconArchive,
  IconTrash,
} from "@tabler/icons-react";
import { useNotesStore, type SidebarView } from "@/stores/notes-store";
import { useNoteTags, useNotes } from "@/hooks/use-notes";

const NAV_ITEMS: { view: SidebarView; label: string; icon: React.ReactNode }[] = [
  { view: "notes", label: "Notes", icon: <IconBulb size={18} /> },
  { view: "reminders", label: "Reminders", icon: <IconBell size={18} /> },
  { view: "archive", label: "Archive", icon: <IconArchive size={18} /> },
  { view: "trash", label: "Trash", icon: <IconTrash size={18} /> },
];

export function NotesSidebar() {
  const sidebarView = useNotesStore((s) => s.sidebarView);
  const setSidebarView = useNotesStore((s) => s.setSidebarView);
  const activeLabel = useNotesStore((s) => s.activeLabel);
  const setActiveLabel = useNotesStore((s) => s.setActiveLabel);
  const closeSidebar = useNotesStore((s) => s.closeSidebar);
  const { data: tags } = useNoteTags();
  const { data: notes } = useNotes();

  const activeCount = (notes ?? []).filter((n) => !n.isPinned).length;
  const pinnedCount = (notes ?? []).filter((n) => n.isPinned).length;

  function handleNavClick(view: SidebarView) {
    setSidebarView(view);
    closeSidebar();
  }

  function handleLabelClick(label: string) {
    setSidebarView("notes");
    setActiveLabel(activeLabel === label ? null : label);
    closeSidebar();
  }

  return (
    <Paper
      withBorder={false}
      className="flex-col w-60 shrink-0 border-r border-[var(--border-subtle)] h-full"
      style={{ background: "var(--mantine-color-body)" }}
    >
      <ScrollArea className="flex-1 px-2 py-3">
        <Stack gap={2}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.view}
              label={item.label}
              leftSection={item.icon}
              active={sidebarView === item.view && !activeLabel}
              onClick={() => handleNavClick(item.view)}
              styles={{ root: { borderRadius: 8 } }}
            />
          ))}
        </Stack>

        {tags && tags.length > 0 && (
          <>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" px="sm" mt="lg" mb="xs">
              Labels
            </Text>
            <Stack gap={2}>
              {tags.map((tag) => (
                <NavLink
                  key={tag.id}
                  label={
                    <Group gap={4} wrap="nowrap">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color || "gray" }}
                      />
                      <Text size="sm">{tag.name}</Text>
                    </Group>
                  }
                  active={activeLabel === tag.name}
                  onClick={() => handleLabelClick(tag.name)}
                  styles={{ root: { borderRadius: 8 } }}
                />
              ))}
            </Stack>
          </>
        )}
      </ScrollArea>
    </Paper>
  );
}
