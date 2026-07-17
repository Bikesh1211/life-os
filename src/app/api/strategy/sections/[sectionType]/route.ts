import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createStrategySection, getSections, sectionTypes } from "@/modules/strategy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sectionType: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sectionType } = await params;
  if (!sectionTypes.includes(sectionType as any)) {
    return NextResponse.json({ error: "Invalid section type" }, { status: 400 });
  }

  try {
    const sections = await getSections(userId, sectionType);
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sectionType: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sectionType } = await params;
  if (!sectionTypes.includes(sectionType as any)) {
    return NextResponse.json({ error: "Invalid section type" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const section = await createStrategySection(userId, sectionType, body.content, {
      sortOrder: body.sortOrder,
      isPinned: body.isPinned,
    });
    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors ?? error.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}
