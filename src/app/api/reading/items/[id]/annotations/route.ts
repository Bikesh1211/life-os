import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createReadingAnnotation,
  getReadingAnnotations,
  createAnnotationSchema,
} from "@/modules/reading";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const annotations = await getReadingAnnotations(userId, { readingItemId: id });
  return NextResponse.json(annotations);
}

export async function POST(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id } = await params;
    const parsed = createAnnotationSchema.parse({ ...body, readingItemId: id });
    const annotation = await createReadingAnnotation(userId, parsed);
    return NextResponse.json(annotation, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create annotation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
