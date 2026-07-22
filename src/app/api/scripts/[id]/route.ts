import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getScript, updateExistingScript, removeScript } from "@/modules/scripts";
import { getSections } from "@/modules/scripts";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const script = await getScript(id, userId);
  if (!script) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sections = await getSections(id);

  return NextResponse.json({ ...script, sections });
}

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id } = await params;
    const script = await updateExistingScript(id, userId, body);
    if (!script) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(script);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update script";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const script = await removeScript(id, userId);
  if (!script) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
