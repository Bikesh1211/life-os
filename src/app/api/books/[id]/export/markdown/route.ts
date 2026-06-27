import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBook, exportBookAsMarkdown } from "@/modules/books";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await exportBookAsMarkdown(id, userId);
  if (!result) return NextResponse.json({ error: "Export failed" }, { status: 500 });

  return new NextResponse(result.markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.book.title.replace(/[^a-zA-Z0-9]/g, "_")}.md"`,
    },
  });
}
