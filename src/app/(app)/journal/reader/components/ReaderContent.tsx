"use client";

import { useRef, useEffect } from "react";
import type { ReaderEntry, ContentBlock } from "../types";

function blockHTML(block: ContentBlock, idx: number): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  switch (block.type) {
    case "heading":
      return `<h${block.level} id="b-${idx}">${esc(block.text)}</h${block.level}>`;
    case "quote":
      return `<blockquote>${esc(block.text)}</blockquote>`;
    case "chapterBreak":
      return `<div class="chapter-break" role="presentation"><span class="break-line" aria-hidden="true"></span><span class="break-star" aria-hidden="true">✦</span><span class="break-line" aria-hidden="true"></span></div>`;
    case "image":
      return `<figure class="journal-image" id="b-${idx}"><img src="${esc(block.src)}" alt="${esc(block.alt || block.caption || "")}" loading="lazy" class="lazy-image" width="1400" height="880">${block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ""}</figure>`;
    case "editorial":
      return `<div class="journal-editorial" id="b-${idx}"><figure><img src="${esc(block.src)}" alt="${esc(block.alt || block.caption || "")}" loading="lazy" class="lazy-image">${block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : ""}</figure><p>${esc(block.text)}</p></div>`;
    case "gallery":
      return `<div class="journal-gallery" id="b-${idx}">${block.images.map((img) => `<figure><img src="${esc(img.src)}" alt="${esc(img.alt || img.caption || "")}" loading="lazy" class="lazy-image">${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ""}</figure>`).join("")}</div>`;
    case "paragraph":
    default:
      return `<p>${esc(block.text)}</p>`;
  }
}

type Props = {
  entry: ReaderEntry;
  index: number;
  total: number;
  wordsOfEntry: (e: ReaderEntry) => number;
  readMinutes: (e: ReaderEntry) => number;
};

export function ReaderContent({ entry, index, total, wordsOfEntry, readMinutes }: Props) {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      pageRef.current.classList.remove("page-in");
      void pageRef.current.offsetWidth;
      pageRef.current.classList.add("page-in");
    }
  }, [index]);

  const blocks = entry.content.map((b, i) => blockHTML(b, i)).join("\n");
  const words = wordsOfEntry(entry);
  const mins = readMinutes(entry);
  const tags = entry.tags.map((t) => `<span class="tag">#${t.replace(/</g, "&lt;")}</span>`).join("");

  const meta = [
    entry.mood ? `<span class="entry-metadata-item">Mood · ${entry.mood}</span>` : "",
    `<span class="entry-metadata-item">${mins} min read</span>`,
  ].join("");

  const padNum = (n: number) => String(n).padStart(3, "0");
  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso + "T12:00:00");
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const html =
    `<article class="entry-reader">` +
    `<header class="entry-header">` +
    `<p class="entry-number">Entry ${padNum(entry.id)}</p>` +
    `<p class="entry-date">${formatDate(entry.date)}</p>` +
    `<h1 class="entry-title">${entry.title.replace(/</g, "&lt;")}</h1>` +
    `</header>` +
    `<section class="entry-body entry-content">${blocks}</section>` +
    `<footer class="entry-footer">` +
    `<div class="entry-metadata">${meta}</div>` +
    (tags ? `<div class="entry-tags">${tags}</div>` : "") +
    `<p class="reading-stats">${words.toLocaleString()} words · ${mins} min read</p>` +
    `</footer>` +
    `</article>`;

  return (
    <div
      ref={pageRef}
      className="reading-paper reader-page"
      id="reader-page"
      aria-live="polite"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
