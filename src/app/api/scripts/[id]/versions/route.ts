import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getScriptVersions, saveVersion, getScript } from "@/modules/scripts";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const items = await getScriptVersions(id);
  return NextResponse.json(items);
}

export async function POST(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const script = await getScript(id, userId);
    if (!script) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const version = await saveVersion(id, body.note);
    return NextResponse.json(version, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save version";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
