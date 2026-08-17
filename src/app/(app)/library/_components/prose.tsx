import Link from "next/link";
import { cn } from "@/core/utils";
import { parseInline, parseMarkdown, type Block, type Inline } from "@/modules/library";
import { CodeBlock } from "./code-block";
import styles from "./library.module.css";

/**
 * The reading surface.
 *
 * This is the part of the library that must not be magical. Everything around
 * it — the shelves, the candlelight, the dust — is atmosphere; here the job is
 * a comfortable line length, a generous leading and type large enough to read
 * for forty minutes. The only ornament allowed through is the drop cap on
 * narrative shelves, and even that is opt-in.
 *
 * Measure is set on the element rather than the page so a wide table or a code
 * block can break out of it without the article having to be re-laid out around
 * them.
 */

export function Prose({
  markdown,
  dropCap = false,
  className,
}: {
  markdown: string;
  /** Opens the first paragraph with an illuminated capital. Narrative shelves only. */
  dropCap?: boolean;
  className?: string;
}) {
  const blocks = parseMarkdown(markdown);

  /* Found before the map rather than tracked through it: the drop cap belongs
     to the first *paragraph*, which is not necessarily the first block — a
     piece may open with a heading or a pull quote. */
  const leadIndex = blocks.findIndex((block) => block.type === "paragraph");

  return (
    <div
      className={cn(
        "text-[1.0625rem] leading-[1.85] text-[var(--lb-fg)]/90 sm:text-[1.125rem] sm:leading-[1.8]",
        className,
      )}
    >
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} dropCap={dropCap && index === leadIndex} />
      ))}
    </div>
  );
}

function BlockView({ block, dropCap }: { block: Block; dropCap: boolean }) {
  switch (block.type) {
    case "heading": {
      /* Headings carry the id the table of contents links to, and
         `scroll-mt` clears the fixed header when one is jumped to. */
      const Tag = `h${block.level}` as "h2";
      return (
        <Tag
          id={block.id}
          className={cn(
            "scroll-mt-28 font-semibold text-balance text-[var(--lb-fg)]",
            block.level <= 2 && "mt-14 mb-4 text-2xl sm:text-3xl",
            block.level === 3 && "mt-10 mb-3 text-xl sm:text-2xl",
            block.level >= 4 && "mt-8 mb-2 text-lg",
          )}
        >
          <InlineView nodes={parseInline(block.text)} />
        </Tag>
      );
    }

    case "paragraph":
      return (
        <p className={cn("my-5", dropCap && styles.dropCap)}>
          <InlineView nodes={parseInline(block.text)} />
        </p>
      );

    case "code":
      return <CodeBlock code={block.code} lang={block.lang} />;

    case "quote":
      return (
        <blockquote className="my-8 border-l-2 border-[color-mix(in_oklab,var(--lb-gold)_55%,transparent)] pl-5 text-xl leading-relaxed text-[var(--lb-fg)]/80 italic sm:text-2xl">
          <InlineView nodes={parseInline(block.text)} />
        </blockquote>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          className={cn(
            "my-5 space-y-2 pl-6",
            block.ordered ? "list-decimal" : "list-disc",
            "marker:text-[color-mix(in_oklab,var(--lb-gold)_70%,transparent)]",
          )}
        >
          {block.items.map((item, index) => (
            <li key={index} className="pl-1">
              <InlineView nodes={parseInline(item)} />
            </li>
          ))}
        </Tag>
      );
    }

    case "table":
      // Wrapped rather than shrunk: a wide table scrolls inside its own box so
      // the page body never scrolls sideways.
      return (
        <div className="-mx-4 my-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full border-collapse text-[0.9375rem]">
            <thead>
              <tr className="border-b border-[var(--lb-border)]">
                {block.head.map((cell, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="lb-caption px-3 py-2.5 text-left whitespace-nowrap"
                    style={{ textAlign: block.align[index] ?? "left" }}
                  >
                    <InlineView nodes={parseInline(cell)} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-[var(--lb-border)]/50">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-3 py-2.5 align-top"
                      style={{ textAlign: block.align[cellIndex] ?? "left" }}
                    >
                      <InlineView nodes={parseInline(cell)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "image":
      return (
        <figure className="my-10">
          {/* eslint-disable-next-line @next/next/no-img-element -- author-supplied
              URLs of unknown origin; `next/image` would need every one of them
              declared in `remotePatterns` before the page would render at all. */}
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            className="w-full rounded-md border border-[var(--lb-border)]"
          />
          {block.caption && (
            <figcaption className="mt-3 text-center text-sm text-[var(--lb-muted)] italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "rule":
      return <div className={cn(styles.rule, "my-12")} role="separator" />;
  }
}

function InlineView({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        switch (node.type) {
          case "text":
            return <span key={index}>{node.value}</span>;

          case "code":
            return (
              <code
                key={index}
                className="rounded-sm bg-[color-mix(in_oklab,var(--lb-gold)_14%,transparent)] px-1.5 py-0.5 font-mono text-[0.875em]"
              >
                {node.value}
              </code>
            );

          case "strong":
            return (
              <strong key={index} className="font-semibold text-[var(--lb-fg)]">
                <InlineView nodes={node.children} />
              </strong>
            );

          case "em":
            return (
              <em key={index}>
                <InlineView nodes={node.children} />
              </em>
            );

          case "del":
            return (
              <del key={index} className="text-[var(--lb-muted)]">
                <InlineView nodes={node.children} />
              </del>
            );

          case "link": {
            const external = /^https?:\/\//.test(node.href);
            const className =
              "underline decoration-[color-mix(in_oklab,var(--lb-gold)_60%,transparent)] underline-offset-4 transition-colors hover:text-[var(--lb-primary)]";

            /* External links get `rel="noopener"` and open in place — a library
               that steals your tab back is worse than one that does not. */
            return external ? (
              <a
                key={index}
                href={node.href}
                title={node.title}
                rel="noopener noreferrer"
                className={className}
              >
                <InlineView nodes={node.children} />
              </a>
            ) : (
              <Link key={index} href={node.href} title={node.title} className={className}>
                <InlineView nodes={node.children} />
              </Link>
            );
          }

          case "image":
            return (
              // eslint-disable-next-line @next/next/no-img-element -- see above
              <img
                key={index}
                src={node.src}
                alt={node.alt}
                title={node.title}
                loading="lazy"
                decoding="async"
                className="inline-block max-w-full rounded-sm align-middle"
              />
            );
        }
      })}
    </>
  );
}
