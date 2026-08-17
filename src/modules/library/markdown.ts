import { slugify } from "./entry";

/**
 * A small, dependency-free Markdown subset — parsed to a tree, never to HTML.
 *
 * Two reasons it is written rather than installed. The first is weight: the
 * portfolio ships no runtime Markdown dependency today, and a parser plus a
 * sanitiser plus a highlighter is a large amount of JavaScript to add to a site
 * whose defining constraint (CONTEXT.md, "Performance") is that atmosphere must
 * not cost the reader anything. The second is safety: this produces React
 * elements, so there is no `dangerouslySetInnerHTML` anywhere in the reading
 * path and no HTML-injection surface to sanitise in the first place. Raw HTML
 * in a document is therefore shown as text, which is the correct outcome for an
 * archive of prose.
 *
 * What is supported is what writing actually uses: headings, paragraphs, lists,
 * blockquotes, fenced code, tables, images, rules, and inline emphasis, code,
 * links and strikethrough.
 */

/* ── Blocks ──────────────────────────────────────────────────────────────── */

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type Block =
  | { type: "heading"; level: HeadingLevel; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; lang: string; code: string }
  | { type: "quote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; head: string[]; rows: string[][]; align: ColumnAlign[] }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "rule" };

export type ColumnAlign = "left" | "center" | "right";

const FENCE = /^\s*```(\S*)\s*$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const UNORDERED = /^\s*[-*+]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;
const RULE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const IMAGE_ONLY = /^\s*!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/;
const TABLE_ROW = /^\s*\|(.+)\|\s*$/;
const TABLE_DIVIDER = /^\s*\|?[\s:-]+\|[\s|:-]*$/;

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    /* Fenced code. Everything to the closing fence is taken verbatim — a
       heading or a list marker inside a snippet is code, not structure. */
    const fence = line.match(FENCE);
    if (fence) {
      const lang = fence[1] || "";
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !FENCE.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence, or the end of the document
      blocks.push({ type: "code", lang, code: body.join("\n") });
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      const level = heading[1].length as HeadingLevel;
      const text = heading[2].trim();
      blocks.push({ type: "heading", level, text, id: slugify(stripInline(text)) });
      i += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ type: "rule" });
      i += 1;
      continue;
    }

    /* A lone image gets its own block so it can be laid out as a figure rather
       than as a stranded paragraph. Its title text becomes the caption. */
    const image = line.match(IMAGE_ONLY);
    if (image) {
      blocks.push({ type: "image", alt: image[1], src: image[2], caption: image[3] });
      i += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const body: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i])) {
        body.push(lines[i].match(QUOTE)![1]);
        i += 1;
      }
      blocks.push({ type: "quote", text: body.join(" ").trim() });
      continue;
    }

    /* Tables need a divider row on the second line — without it, a paragraph
       that happens to contain pipes is a paragraph. */
    if (TABLE_ROW.test(line) && i + 1 < lines.length && TABLE_DIVIDER.test(lines[i + 1])) {
      const head = splitRow(line);
      const align = splitRow(lines[i + 1]).map(columnAlign);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && TABLE_ROW.test(lines[i])) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      blocks.push({ type: "table", head, rows, align });
      continue;
    }

    const ordered = ORDERED.test(line);
    if (ordered || UNORDERED.test(line)) {
      const pattern = ordered ? ORDERED : UNORDERED;
      const items: string[] = [];
      while (i < lines.length && pattern.test(lines[i])) {
        let item = lines[i].match(pattern)![1];
        i += 1;
        // A wrapped item: an indented continuation line belongs to the item
        // above it, not to a new paragraph.
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !pattern.test(lines[i])) {
          item += ` ${lines[i].trim()}`;
          i += 1;
        }
        items.push(item.trim());
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    // Paragraph: everything up to the next blank line or block opener.
    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !opensBlock(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    if (paragraph.length === 0) {
      // `opensBlock` matched on the very first line without any earlier branch
      // claiming it — take the line as prose rather than looping forever.
      paragraph.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

function opensBlock(line: string): boolean {
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    QUOTE.test(line) ||
    RULE.test(line) ||
    UNORDERED.test(line) ||
    ORDERED.test(line) ||
    IMAGE_ONLY.test(line)
  );
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

function columnAlign(spec: string): ColumnAlign {
  const left = spec.startsWith(":");
  const right = spec.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  return "left";
}

/* ── Inline ──────────────────────────────────────────────────────────────── */

export type Inline =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "del"; children: Inline[] }
  | { type: "link"; href: string; title?: string; children: Inline[] }
  | { type: "image"; src: string; alt: string; title?: string };

/**
 * A left-to-right scanner rather than one alternating regex.
 *
 * Emphasis nests, and a single pattern that tries to match nested delimiters
 * is where Markdown parsers acquire their catastrophic-backtracking bugs. This
 * walks the string once, tries a short list of anchored matchers at each stop,
 * and recurses only into what a matcher actually consumed — so the work is
 * bounded by the length of the text.
 */
export function parseInline(source: string): Inline[] {
  const nodes: Inline[] = [];
  let text = "";
  let i = 0;

  const flush = () => {
    if (text) {
      nodes.push({ type: "text", value: text });
      text = "";
    }
  };

  while (i < source.length) {
    const rest = source.slice(i);

    // Escapes come first: `\*` is a literal asterisk, not an emphasis marker.
    if (rest[0] === "\\" && rest.length > 1) {
      text += rest[1];
      i += 2;
      continue;
    }

    const image = rest.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);
    if (image) {
      flush();
      nodes.push({ type: "image", alt: image[1], src: image[2], title: image[3] });
      i += image[0].length;
      continue;
    }

    const link = rest.match(/^\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/);
    if (link) {
      flush();
      nodes.push({
        type: "link",
        href: link[2],
        title: link[3],
        children: parseInline(link[1]),
      });
      i += link[0].length;
      continue;
    }

    // Inline code is opaque: nothing inside it is markup.
    const code = rest.match(/^(`+)([\s\S]*?)\1/);
    if (code) {
      flush();
      nodes.push({ type: "code", value: code[2].trim() });
      i += code[0].length;
      continue;
    }

    const strong = rest.match(/^(\*\*|__)(?=\S)([\s\S]*?\S)\1/);
    if (strong) {
      flush();
      nodes.push({ type: "strong", children: parseInline(strong[2]) });
      i += strong[0].length;
      continue;
    }

    const del = rest.match(/^~~(?=\S)([\s\S]*?\S)~~/);
    if (del) {
      flush();
      nodes.push({ type: "del", children: parseInline(del[1]) });
      i += del[0].length;
      continue;
    }

    /* Underscores only open emphasis at a word boundary, so `snake_case_name`
       survives a document intact — which matters in an archive that contains
       engineering notes. */
    const em = rest.match(/^\*(?=\S)([\s\S]*?\S)\*/) ?? matchUnderscoreEm(source, i);
    if (em) {
      flush();
      nodes.push({ type: "em", children: parseInline(em[1]) });
      i += em[0].length;
      continue;
    }

    text += rest[0];
    i += 1;
  }

  flush();
  return nodes;
}

function matchUnderscoreEm(source: string, index: number): RegExpMatchArray | null {
  if (source[index] !== "_") return null;
  const before = index === 0 ? "" : source[index - 1];
  if (before && /\w/.test(before)) return null;
  return source.slice(index).match(/^_(?=\S)([\s\S]*?\S)_(?!\w)/);
}

/** The plain text of an inline string — for slugs, excerpts and metadata. */
export function stripInline(source: string): string {
  return flattenInline(parseInline(source));
}

export function flattenInline(nodes: Inline[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "text":
        case "code":
          return node.value;
        case "image":
          return node.alt;
        default:
          return flattenInline(node.children);
      }
    })
    .join("");
}

/* ── Table of contents ───────────────────────────────────────────────────── */

export interface TocItem {
  id: string;
  text: string;
  level: HeadingLevel;
}

/**
 * The headings worth navigating by.
 *
 * `h2` and `h3` only: `h1` belongs to the entry title, which is already at the
 * top of the page, and a contents list that descends to `h4` stops being a map
 * and becomes a second copy of the document.
 */
export function tableOfContents(blocks: Block[]): TocItem[] {
  return blocks
    .filter(
      (block): block is Extract<Block, { type: "heading" }> =>
        block.type === "heading" && (block.level === 2 || block.level === 3),
    )
    .map((block) => ({ id: block.id, text: stripInline(block.text), level: block.level }));
}

/** First paragraph, trimmed — the fallback description when none was written. */
export function leadParagraph(blocks: Block[], limit = 180): string {
  const paragraph = blocks.find((block) => block.type === "paragraph");
  if (!paragraph || paragraph.type !== "paragraph") return "";
  const text = stripInline(paragraph.text);
  return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
}
