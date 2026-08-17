import type { Metadata } from "next";
import { requireAuth } from "@/core/auth";
import { ArchiveCrumb } from "../_components/archive-crumb";
import { ArchiveDesk } from "./_components/archive-desk";

export const metadata: Metadata = {
  title: "The Archive Desk",
  description: "Add and edit the places, expeditions and journals the archive is built from.",
};

/**
 * The desk reads and writes through the travel API, so it is a client
 * component and this page exists only to hold the auth gate and the crumb —
 * the same shape every other section of the archive has.
 */
export default async function ManagePage() {
  await requireAuth();

  return (
    <main className="xp-container py-12 sm:py-16">
      <ArchiveCrumb />
      <ArchiveDesk />
    </main>
  );
}
