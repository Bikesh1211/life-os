"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconPencilBolt } from "@tabler/icons-react";
import { useHotkeys } from "@mantine/hooks";
import { useNotesStore } from "@/stores/notes-store";
import { QuickNoteModal } from "./QuickNoteModal";

export function FloatingQuickNote() {
  const openQuickNote = useNotesStore((s) => s.openQuickNote);

  useHotkeys([["mod+Shift+N", () => openQuickNote()]]);

  return (
    <>
      <Tooltip label="Quick Note (⌘⇧N)">
        <ActionIcon
          variant="filled"
          size="xl"
          radius="xl"
          className="fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-shadow"
          onClick={openQuickNote}
        >
          <IconPencilBolt size={24} />
        </ActionIcon>
      </Tooltip>

      <QuickNoteModal />
    </>
  );
}
