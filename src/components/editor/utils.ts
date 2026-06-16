export function textToEditorContent(text?: string | null): unknown {
  if (!text || text.trim().length === 0) return undefined;
  const lines = text.split("\n").filter(Boolean);
  if (lines.length === 0) return undefined;
  if (lines.length === 1) {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: lines[0] }],
        },
      ],
    };
  }
  return {
    type: "doc",
    content: lines.map((line) => ({
      type: "paragraph",
      content: [{ type: "text", text: line }],
    })),
  };
}

export function textFromEditor(json: unknown): string {
  if (!json) return "";
  const doc = json as { content?: Array<{ content?: Array<{ text?: string }> }> };
  if (!doc.content) return "";
  return doc.content
    .map((node) => {
      if (!node.content) return "";
      return node.content.map((n) => n.text ?? "").join("");
    })
    .filter(Boolean)
    .join("\n");
}
