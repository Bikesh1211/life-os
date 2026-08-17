import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

/** The breadcrumb every archive section opens with. */
export function ArchiveCrumb({
  label = "The Adventure Archive",
  href = "/travel/explore",
}: {
  label?: string;
  href?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <Link
        href={href}
        className="xp-label inline-flex items-center gap-1.5 text-[var(--xp-muted)] transition-colors hover:text-[var(--xp-primary)]"
      >
        <IconArrowLeft size={12} />
        {label}
      </Link>
    </nav>
  );
}
