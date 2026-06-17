import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  updateReadingAnnotation,
  deleteReadingAnnotation,
} from "@/modules/reading";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id } = await params;
  const annotation = await updateReadingAnnotation(id, userId, body);
  if (!annotation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(annotation);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const annotation = await deleteReadingAnnotation(id, userId);
  if (!annotation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
