import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateAdhocItem, deleteAdhocItem } from "@/modules/routines";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const item = await updateAdhocItem(id, userId, body);
    if (!item) {
      return NextResponse.json({ error: "Ad-hoc item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    if (error?.message?.includes("overlaps")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update ad-hoc item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const deleted = await deleteAdhocItem(id, userId);
    if (!deleted) {
      return NextResponse.json({ error: "Ad-hoc item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete ad-hoc item" }, { status: 500 });
  }
}
