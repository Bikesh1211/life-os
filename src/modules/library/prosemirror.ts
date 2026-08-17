/**
 * TipTap documents, flattened to Markdown.
 *
 * Book chapters are written in the Creator Studio's TipTap editor and stored as
 * a ProseMirror document — a JSON tree, not prose. The library reads prose, so
 * something has to translate, and this is the seam.
 *
 * Markdown rather than HTML on purpose. The reading surface parses Markdown to
 * React elements (see `markdown.ts`), which means there is no
 * `dangerouslySetInnerHTML` anywhere in the reading path and no HTML-injection
 * surface to sanitise. Converting to HTML here would give that up for nothing:
 * the editor's own node set maps cleanly onto the Markdown subset the reader
 * already supports.
 *
 * A node type this does not recognise is descended into rather than dropped, so
 * an extension added to the editor later degrades to its text content instead
 * of vanishing from the shelf.
 */

interface PmMark {
  type?: string;
  attrs?: Record<string, unknown>;
}

interface PmNode {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: PmMark[];
  content?: PmNode[];
}

export function isProseMirrorDoc(value: unknown): value is PmNode {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as PmNode).type === "doc" &&
    Array.isArray((value as PmNode).content)
  );
}

export function proseMirrorToMarkdown(value: unknown): string {
  if (!isProseMirrorDoc(value)) return "";
  return blocks(value.content ?? [])
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function blocks(nodes: PmNode[], depth = 0): string[] {
  const out: string[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case "paragraph": {
        const text = inline(node.content ?? []).trim();
        // An empty paragraph is the editor's blank line, not a block.
        if (text) out.push(text);
        break;
      }

      case "heading": {
        const level = Math.min(6, Math.max(1, Number(node.attrs?.level ?? 1)));
        out.push(`${"#".repeat(level)} ${inline(node.content ?? []).trim()}`);
        break;
      }

      case "blockquote":
        out.push(
          blocks(node.content ?? [], depth)
            .join("\n\n")
            .split("\n")
            .map((line) => `> ${line}`)
            .join("\n"),
        );
        break;

      case "codeBlock":
        out.push(`\`\`\`${String(node.attrs?.language ?? "")}\n${plain(node.content ?? [])}\n\`\`\``);
        break;

      case "bulletList":
      case "orderedList": {
        const ordered = node.type === "orderedList";
        const items = (node.content ?? []).map((item, index) => {
          const marker = ordered ? `${index + 1}.` : "-";
          const body = blocks(item.content ?? [], depth + 1).join("\n\n");
          // Continuation lines indent under the marker so a nested list stays
          // nested when the reader re-parses it.
          const [first = "", ...rest] = body.split("\n");
          return [`${marker} ${first}`, ...rest.map((line) => `  ${line}`)].join("\n");
        });
        out.push(items.join("\n"));
        break;
      }

      case "taskList": {
        const items = (node.content ?? []).map((item) => {
          const box = item.attrs?.checked ? "[x]" : "[ ]";
          return `- ${box} ${blocks(item.content ?? [], depth + 1).join(" ")}`;
        });
        out.push(items.join("\n"));
        break;
      }

      case "horizontalRule":
        out.push("---");
        break;

      case "image": {
        const src = String(node.attrs?.src ?? "");
        if (src) out.push(`![${String(node.attrs?.alt ?? "")}](${src})`);
        break;
      }

      case "table": {
        const rows = (node.content ?? []).map((row) =>
          (row.content ?? []).map((cell) => inline(cell.content?.[0]?.content ?? []).trim()),
        );
        if (rows.length === 0) break;
        const [head, ...body] = rows;
        out.push(
          [
            `| ${head.join(" | ")} |`,
            `| ${head.map(() => "---").join(" | ")} |`,
            ...body.map((row) => `| ${row.join(" | ")} |`),
          ].join("\n"),
        );
        break;
      }

      case "hardBreak":
        break;

      default:
        // Unknown block: keep its children rather than losing the words.
        if (node.content) out.push(...blocks(node.content, depth));
        else if (node.text) out.push(node.text);
    }
  }

  return out.filter(Boolean);
}

function inline(nodes: PmNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "hardBreak") return "\n";
      if (node.type === "image") {
        return `![${String(node.attrs?.alt ?? "")}](${String(node.attrs?.src ?? "")})`;
      }
      if (typeof node.text !== "string") {
        return node.content ? inline(node.content) : "";
      }

      let text = node.text;
      /* Marks wrap outward — code innermost, because everything inside a code
         span is literal and wrapping it in emphasis markers would put asterisks
         on the page. */
      const marks = new Set((node.marks ?? []).map((mark) => mark.type));

      if (marks.has("code")) return `\`${text}\``;
      if (marks.has("bold") || marks.has("strong")) text = `**${text}**`;
      if (marks.has("italic") || marks.has("em")) text = `*${text}*`;
      if (marks.has("strike")) text = `~~${text}~~`;

      const link = (node.marks ?? []).find((mark) => mark.type === "link");
      if (link?.attrs?.href) text = `[${text}](${String(link.attrs.href)})`;

      return text;
    })
    .join("");
}

/** Text only — for code blocks, where markup would be a lie. */
function plain(nodes: PmNode[]): string {
  return nodes
    .map((node) => (typeof node.text === "string" ? node.text : plain(node.content ?? [])))
    .join("");
}
