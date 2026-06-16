"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Text } from "@mantine/core";
import { EditorToolbar } from "./EditorToolbar";
import { createExtensions } from "./extensions";
import { DEFAULT_PLACEHOLDER } from "./constants";
import type { EditorProps } from "./types";

export function Editor({
  content,
  onChange,
  placeholder = DEFAULT_PLACEHOLDER,
  editable = true,
  minHeight = "250px",
  showToolbar = true,
  className,
}: EditorProps) {
  const extensions = createExtensions(placeholder);

  const editor = useEditor({
    extensions,
    editable,
    content: content ?? { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor: ed }) => {
      if (!onChange) return;
      onChange(ed.getJSON(), ed.getHTML(), ed.getText());
    },
    editorProps: {
      attributes: {
        class: ["prose prose-invert max-w-none focus:outline-none px-3 sm:px-4 py-3", className]
          .filter(Boolean)
          .join(" "),
        style: `min-height: ${minHeight}`,
      },
    },
  });

  useEffect(() => {
    if (editor && editable !== editor.isEditable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  return (
    <div className="relative">
      {showToolbar && editor && <EditorToolbar editor={editor} />}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
