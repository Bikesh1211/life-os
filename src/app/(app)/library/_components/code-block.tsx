"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { cn } from "@/core/utils";
import { highlight, languageLabel, type TokenKind } from "@/modules/library";
import styles from "./library.module.css";

const TOKEN_CLASS: Record<TokenKind, string | undefined> = {
  plain: undefined,
  comment: styles.tokenComment,
  string: styles.tokenString,
  number: styles.tokenNumber,
  keyword: styles.tokenKeyword,
  punctuation: styles.tokenPunctuation,
};

/**
 * A fenced code block with a copy control.
 *
 * The whole component is a client component only because of the clipboard; the
 * tokens themselves are computed during render on both server and client from
 * the same pure function, so the highlighted markup is in the HTML and does not
 * wait for hydration to appear.
 *
 * The block scrolls inside itself (`overflow-x: auto`) rather than widening the
 * article — a long line in a snippet must never make the page scroll sideways,
 * which is the single most common way a reading layout breaks on a phone.
 */
export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // A denied or unavailable clipboard is not worth an error state — the
      // code is on the page and can still be selected by hand.
    }
  }

  const tokens = highlight(code, lang);

  return (
    <figure className={cn(styles.codeSurface, "group my-8 overflow-hidden rounded-md")}>
      <figcaption className="flex items-center justify-between border-b border-[color-mix(in_oklab,var(--lb-gold)_18%,transparent)] px-4 py-2">
        <span className="font-mono text-[10px] tracking-[0.18em] text-[color-mix(in_oklab,var(--lb-parchment)_55%,transparent)] uppercase">
          {languageLabel(lang)}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-[color-mix(in_oklab,var(--lb-parchment)_65%,transparent)] uppercase transition-colors hover:text-[var(--lb-gold)] focus-visible:text-[var(--lb-gold)]"
        >
          {copied ? <IconCheck size={12} className="" /> : <IconCopy size={12} className="" />}
          {copied ? "Copied" : "Copy"}
          <span className="sr-only">{copied ? "Code copied" : "IconCopy code to clipboard"}</span>
        </button>
      </figcaption>

      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono">
          {tokens.map((token, index) => (
            <span key={index} className={TOKEN_CLASS[token.kind]}>
              {token.value}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
