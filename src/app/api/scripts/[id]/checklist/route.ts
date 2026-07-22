import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getChecklistItems, addChecklistItem, createChecklistItemSchema } from "@/modules/scripts";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const items = await getChecklistItems(id);
  return NextResponse.json(items);
}

export async function POST(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id } = await params;
    const parsed = createChecklistItemSchema.parse({ ...body, scriptId: id });
    const item = await addChecklistItem(parsed);
    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create checklist item";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
