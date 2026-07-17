import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { updateBudget, deleteBudget } from "@/modules/time-audit";

type Props = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Props) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const budget = await updateBudget(id, userId, body);
    if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(budget);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors ?? error.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to update budget" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const budget = await deleteBudget(id, userId);
    if (!budget) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}
