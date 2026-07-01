"use client";

import { useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { ActionIcon, Tooltip, Group, Divider, Select } from "@mantine/core";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconQuote,
  IconList,
  IconListNumbers,
  IconCheckbox,
  IconPhoto,
  IconArrowBackUp,
  IconArrowForwardUp,
} from "@tabler/icons-react";
import { HEADING_OPTIONS } from "@/components/editor/constants";

type Props = {
  editor: Editor;
};

export function JournalEditorToolbar({ editor }: Props) {
  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  function getCurrentHeading(): string {
    if (editor.isActive("heading", { level: 1 })) return "heading1";
    if (editor.isActive("heading", { level: 2 })) return "heading2";
    if (editor.isActive("heading", { level: 3 })) return "heading3";
    return "paragraph";
  }

  function handleHeadingChange(value: string | null) {
    if (!value) return;
    if (value === "paragraph") editor.chain().focus().setParagraph().run();
    else {
      const level = Number(value.replace("heading", "")) as 1 | 2 | 3;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-2 py-1 shadow-sm dark:border-gray-700 dark:bg-gray-850">
      <Group gap={2} wrap="wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={IconArrowBackUp}
          label="Undo"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={IconArrowForwardUp}
          label="Redo"
        />

        <Divider orientation="vertical" size="sm" mx={2} />

        <Select
          data={HEADING_OPTIONS as unknown as { value: string; label: string }[]}
          value={getCurrentHeading()}
          onChange={handleHeadingChange}
          size="xs"
          className="w-24"
        />

        <Divider orientation="vertical" size="sm" mx={2} />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          icon={IconBold}
          label="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          icon={IconItalic}
          label="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          icon={IconUnderline}
          label="Underline"
        />

        <Divider orientation="vertical" size="sm" mx={2} />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          icon={IconQuote}
          label="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          icon={IconList}
          label="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          icon={IconListNumbers}
          label="Numbered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive("taskList")}
          icon={IconCheckbox}
          label="Checklist"
        />

        <Divider orientation="vertical" size="sm" mx={2} />

        <ToolbarButton onClick={addImage} icon={IconPhoto} label="Image" />
      </Group>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}) {
  return (
    <Tooltip label={label} withArrow position="bottom">
      <ActionIcon
        variant={active ? "filled" : "subtle"}
        size="sm"
        onClick={onClick}
        aria-label={label}
      >
        <Icon size={15} />
      </ActionIcon>
    </Tooltip>
  );
}
