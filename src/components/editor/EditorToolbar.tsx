"use client";

import { useCallback, type ComponentType } from "react";
import type { Editor } from "@tiptap/react";
import { ActionIcon, Tooltip, Group, Divider, Select } from "@mantine/core";
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconUnderline,
  IconCode,
  IconQuote,
  IconList,
  IconListNumbers,
  IconCheckbox,
  IconTable,
  IconLink,
  IconPhoto,
  IconMinus,
  IconClearFormatting,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
} from "@tabler/icons-react";
import { HEADING_OPTIONS } from "./constants";

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  icon: ComponentType<{ size?: number }>;
  label: string;
}

function ToolbarButton({ onClick, active, icon: Icon, label }: ToolbarButtonProps) {
  return (
    <Tooltip label={label} withArrow position="bottom">
      <ActionIcon
        variant={active ? "filled" : "subtle"}
        size="sm"
        onClick={onClick}
        aria-label={label}
      >
        <Icon size={16} />
      </ActionIcon>
    </Tooltip>
  );
}

interface ToolbarSectionProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: ToolbarSectionProps) {
  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
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
    <div className="sticky top-0 z-10 border-b border-[var(--mantine-color-dark-5)] bg-[var(--mantine-color-body)] px-1 sm:px-2 py-1">
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
          className="w-28"
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
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          icon={IconStrikethrough}
          label="Strikethrough"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          icon={IconCode}
          label="Inline Code"
        />

        <Divider orientation="vertical" size="sm" mx={2} />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          icon={IconQuote}
          label="Blockquote"
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
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          icon={IconCode}
          label="Code Block"
        />

        <Divider orientation="vertical" size="sm" mx={2} />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          icon={IconAlignLeft}
          label="Align Left"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          icon={IconAlignCenter}
          label="Align Center"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          icon={IconAlignRight}
          label="Align Right"
        />

        <Divider orientation="vertical" size="sm" mx={2} />

        <ToolbarButton onClick={addTable} icon={IconTable} label="Table" />
        <ToolbarButton
          onClick={addLink}
          active={editor.isActive("link")}
          icon={IconLink}
          label="Link"
        />
        <ToolbarButton onClick={addImage} icon={IconPhoto} label="Image" />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={IconMinus}
          label="Divider"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          icon={IconClearFormatting}
          label="Clear Formatting"
        />
      </Group>
    </div>
  );
}
