import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { updateStrategySection, deleteStrategySection, sectionTypes } from "@/modules/strategy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sectionType: string; id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sectionType, id } = await params;
  if (!sectionTypes.includes(sectionType as any)) {
    return NextResponse.json({ error: "Invalid section type" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const section = await updateStrategySection(id, userId, body.content, sectionType);
    if (!section) return NextResponse.json({ error: "Section not found" }, { status: 404 });
    return NextResponse.json(section);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors ?? error.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sectionType: string; id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sectionType, id } = await params;
  if (!sectionTypes.includes(sectionType as any)) {
    return NextResponse.json({ error: "Invalid section type" }, { status: 400 });
  }

  try {
    const section = await deleteStrategySection(id, userId);
    if (!section) return NextResponse.json({ error: "Section not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
  }
}
