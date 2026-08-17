/**
 * A small syntax highlighter — five token kinds, no grammars.
 *
 * The honest description of what this does: it finds comments, strings,
 * numbers and a language's reserved words, and leaves everything else alone.
 * That is not a parser and it will not colour a type parameter differently
 * from a variable. It is, however, about forty lines and no dependency, and it
 * covers the thing a reader actually needs from a code block in an article —
 * seeing at a glance where the strings and the comments are.
 *
 * A full highlighter (Shiki, Prism, highlight.js) is between 40kB and 300kB of
 * JavaScript or a build-time pipeline, for an archive whose code blocks are
 * incidental to its prose. If the articles shelf ever becomes mostly code, this
 * is the seam to replace — `highlight()` in, tokens out.
 */

export type TokenKind = "plain" | "comment" | "string" | "number" | "keyword" | "punctuation";

export interface Token {
  kind: TokenKind;
  value: string;
}

/**
 * Reserved words by language family rather than by language: `ts` and `js`
 * share a list because the difference between them is types, and this does not
 * model types.
 */
const KEYWORDS: Record<string, string[]> = {
  js: [
    "await",
    "async",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "finally",
    "for",
    "from",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "let",
    "new",
    "null",
    "of",
    "return",
    "static",
    "super",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "undefined",
    "var",
    "void",
    "while",
    "yield",
    "true",
    "false",
    "interface",
    "type",
    "enum",
    "implements",
    "readonly",
    "as",
    "satisfies",
    "declare",
    "namespace",
    "public",
    "private",
    "protected",
    "abstract",
    "keyof",
    "infer",
  ],
  py: [
    "and",
    "as",
    "assert",
    "async",
    "await",
    "break",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "False",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "None",
    "nonlocal",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "True",
    "try",
    "while",
    "with",
    "yield",
  ],
  sh: [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "for",
    "in",
    "do",
    "done",
    "while",
    "case",
    "esac",
    "function",
    "return",
    "export",
    "local",
    "echo",
    "cd",
    "set",
    "source",
  ],
  css: ["important", "media", "supports", "keyframes", "import", "layer", "from", "to"],
  sql: [
    "select",
    "from",
    "where",
    "insert",
    "into",
    "values",
    "update",
    "set",
    "delete",
    "join",
    "left",
    "right",
    "inner",
    "outer",
    "on",
    "group",
    "by",
    "order",
    "having",
    "limit",
    "create",
    "table",
    "index",
    "drop",
    "alter",
    "and",
    "or",
    "not",
    "null",
    "as",
  ],
};

/** Which family a fence's language tag belongs to. */
const FAMILY: Record<string, keyof typeof KEYWORDS> = {
  js: "js",
  jsx: "js",
  ts: "js",
  tsx: "js",
  javascript: "js",
  typescript: "js",
  json: "js",
  json5: "js",
  py: "py",
  python: "py",
  sh: "sh",
  bash: "sh",
  zsh: "sh",
  shell: "sh",
  console: "sh",
  css: "css",
  scss: "css",
  less: "css",
  sql: "sql",
};

/** Languages whose line comments start with `#` rather than `//`. */
const HASH_COMMENTS = new Set<keyof typeof KEYWORDS>(["py", "sh"]);

export function highlight(code: string, lang: string): Token[] {
  const family = FAMILY[lang.toLowerCase()];

  // An unknown or absent language tag is left as plain text. Guessing the
  // language of a snippet and colouring it wrongly is worse than not colouring
  // it at all.
  if (!family) return [{ kind: "plain", value: code }];

  const keywords = new Set(KEYWORDS[family]);
  const hashComments = HASH_COMMENTS.has(family);
  const tokens: Token[] = [];

  let plain = "";
  let i = 0;

  const push = (kind: TokenKind, value: string) => {
    if (plain) {
      tokens.push({ kind: "plain", value: plain });
      plain = "";
    }
    tokens.push({ kind, value });
  };

  while (i < code.length) {
    const rest = code.slice(i);

    // Line comments.
    if ((!hashComments && rest.startsWith("//")) || (hashComments && rest[0] === "#")) {
      const end = rest.indexOf("\n");
      const value = end === -1 ? rest : rest.slice(0, end);
      push("comment", value);
      i += value.length;
      continue;
    }

    // Block comments (and CSS, which has only these).
    if (rest.startsWith("/*")) {
      const end = rest.indexOf("*/");
      const value = end === -1 ? rest : rest.slice(0, end + 2);
      push("comment", value);
      i += value.length;
      continue;
    }

    // Strings. Escapes are honoured so `"a \" b"` does not end early.
    if (rest[0] === '"' || rest[0] === "'" || rest[0] === "`") {
      const quote = rest[0];
      let j = 1;
      while (j < rest.length && rest[j] !== quote) {
        j += rest[j] === "\\" ? 2 : 1;
      }
      const value = rest.slice(0, Math.min(j + 1, rest.length));
      push("string", value);
      i += value.length;
      continue;
    }

    const number = rest.match(/^-?\d[\d_]*(\.\d+)?([eE][+-]?\d+)?/);
    if (number && !/[\w$]/.test(code[i - 1] ?? "")) {
      push("number", number[0]);
      i += number[0].length;
      continue;
    }

    const word = rest.match(/^[A-Za-z_$][\w$]*/);
    if (word) {
      if (keywords.has(word[0])) push("keyword", word[0]);
      else plain += word[0];
      i += word[0].length;
      continue;
    }

    if (/[{}()[\];:,.<>=+\-*/%!&|?]/.test(rest[0])) {
      push("punctuation", rest[0]);
      i += 1;
      continue;
    }

    plain += rest[0];
    i += 1;
  }

  if (plain) tokens.push({ kind: "plain", value: plain });
  return tokens;
}

/** The label printed on a code block's chrome. */
export function languageLabel(lang: string): string {
  if (!lang) return "text";
  const pretty: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TSX",
    js: "JavaScript",
    jsx: "JSX",
    py: "Python",
    sh: "Shell",
    bash: "Bash",
    css: "CSS",
    html: "HTML",
    json: "JSON",
    sql: "SQL",
    md: "Markdown",
    yml: "YAML",
    yaml: "YAML",
  };
  return pretty[lang.toLowerCase()] ?? lang;
}
