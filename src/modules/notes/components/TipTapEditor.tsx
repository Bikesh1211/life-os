"use client";

import { useCallback, useState, type ComponentType } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { ActionIcon, Tooltip, Group, Divider, Select, Text } from "@mantine/core";
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
} from "@tabler/icons-react";

type TipTapEditorProps = {
  content: unknown;
  onChange: (json: unknown, html: string, text: string) => void;
  placeholder?: string;
};

function MenuBar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
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

  if (!editor) return null;

  const Button = ({
    onClick,
    active,
    icon: Icon,
    label,
  }: {
    onClick: () => void;
    active?: boolean;
    icon: ComponentType<{ size?: number }>;
    label: string;
  }) => (
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

  return (
    <div className="sticky top-0 z-10 border-b border-[var(--mantine-color-dark-5)] bg-[var(--mantine-color-body)] px-2 py-1">
      <Group gap={4} wrap="wrap">
        <Button onClick={() => editor.chain().focus().undo().run()} icon={IconArrowBackUp} label="Undo" />
        <Button onClick={() => editor.chain().focus().redo().run()} icon={IconArrowForwardUp} label="Redo" />

        <Divider orientation="vertical" size="sm" mx={2} />

        <Select
          data={[
            { value: "paragraph", label: "Paragraph" },
            { value: "heading1", label: "Heading 1" },
            { value: "heading2", label: "Heading 2" },
            { value: "heading3", label: "Heading 3" },
          ]}
          value={
            editor.isActive("heading", { level: 1 })
              ? "heading1"
              : editor.isActive("heading", { level: 2 })
                ? "heading2"
                : editor.isActive("heading", { level: 3 })
                  ? "heading3"
                  : "paragraph"
          }
          onChange={(v) => {
            if (v === "paragraph") editor.chain().focus().setParagraph().run();
            else if (v === "heading1") editor.chain().focus().toggleHeading({ level: 1 }).run();
            else if (v === "heading2") editor.chain().focus().toggleHeading({ level: 2 }).run();
            else if (v === "heading3") editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          size="xs"
          className="w-28"
        />

        <Divider orientation="vertical" size="sm" mx={2} />

        <Button onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} icon={IconBold} label="Bold" />
        <Button onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} icon={IconItalic} label="Italic" />
        <Button onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} icon={IconUnderline} label="Underline" />
        <Button onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} icon={IconStrikethrough} label="Strikethrough" />
        <Button onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} icon={IconCode} label="Inline Code" />

        <Divider orientation="vertical" size="sm" mx={2} />

        <Button onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} icon={IconQuote} label="Blockquote" />
        <Button onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} icon={IconList} label="Bullet List" />
        <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} icon={IconListNumbers} label="Numbered List" />
        <Button onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} icon={IconCheckbox} label="Checklist" />
        <Button onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} icon={IconCode} label="Code Block" />

        <Divider orientation="vertical" size="sm" mx={2} />

        <Button onClick={addTable} icon={IconTable} label="Table" />
        <Button onClick={addLink} active={editor.isActive("link")} icon={IconLink} label="Link" />
        <Button onClick={addImage} icon={IconPhoto} label="Image" />
        <Button onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={IconMinus} label="Divider" />
        <Button onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} icon={IconClearFormatting} label="Clear Formatting" />
      </Group>
    </div>
  );
}

export function TipTapEditor({ content, onChange, placeholder = "Start writing..." }: TipTapEditorProps) {
  const [isSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      LinkExtension.configure({ openOnClick: true }),
      ImageExtension,
      Placeholder.configure({ placeholder }),
    ],
    content: content ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      const html = ed.getHTML();
      const text = ed.getText();
      onChange(json, html, text);
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3",
      },
    },
  });

  return (
    <div className="relative">
      {editor && <MenuBar editor={editor} />}
      <div className="relative">
        <EditorContent editor={editor} />
        {isSaving && (
          <Text size="xs" c="dimmed" className="absolute bottom-2 right-2">
            Saving...
          </Text>
        )}
      </div>
    </div>
  );
}
