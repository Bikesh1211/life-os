import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { exportEntryAsMarkdown } from "@/modules/journal";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const markdown = await exportEntryAsMarkdown(id, userId);
    if (!markdown) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="journal-entry-${id}.md"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export entry" }, { status: 500 });
  }
}
