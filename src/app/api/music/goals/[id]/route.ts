import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { updateGoalConfig, deleteGoalConfig, updateGoalConfigSchema } from "@/modules/music";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateGoalConfigSchema.parse(body);
    const config = await updateGoalConfig(id, userId, parsed);
    if (!config) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Failed to update goal config" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await deleteGoalConfig(id, userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete goal config" }, { status: 500 });
  }
}
