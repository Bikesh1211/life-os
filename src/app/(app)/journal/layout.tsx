import type { Metadata } from "next";
import { NightfallShell } from "./_components/NightfallShell";

export const metadata: Metadata = {
  title: {
    default: "Nightfall",
    template: "%s — Nightfall",
  },
  description: "A private world for your thoughts.",
};

/**
 * The journal's shell.
 *
 * Every route under `/journal` renders inside Nightfall — the entries, the
 * timeline, the insights, a single entry, the editor. One layout, the same way
 * `/library` wraps its whole room in one, so there is no page that can forget
 * to be in the journal.
 */
export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return <NightfallShell>{children}</NightfallShell>;
}
