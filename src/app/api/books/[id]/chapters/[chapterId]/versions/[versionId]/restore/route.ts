import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBook, restoreVersion } from "@/modules/books";

type Params = { params: Promise<{ id: string; chapterId: string; versionId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const book = await getBook(id, userId);
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { versionId } = await params;
  const chapter = await restoreVersion(versionId, userId);
  if (!chapter) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  return NextResponse.json(chapter);
}
