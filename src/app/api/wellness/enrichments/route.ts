import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createHabitEnrichment, getHabitEnrichments, updateHabitEnrichment, deleteHabitEnrichment } from "@/modules/wellness";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const wellnessType = searchParams.get("wellnessType") ?? undefined;
    const enrichments = await getHabitEnrichments(userId, wellnessType);
    return NextResponse.json(enrichments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch enrichments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const enrichment = await createHabitEnrichment(userId, body);
    return NextResponse.json(enrichment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create enrichment" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const enrichment = await updateHabitEnrichment(id, userId, data);
    if (!enrichment) return NextResponse.json({ error: "Enrichment not found" }, { status: 404 });
    return NextResponse.json(enrichment);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update enrichment" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const enrichment = await deleteHabitEnrichment(id, userId);
    if (!enrichment) return NextResponse.json({ error: "Enrichment not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete enrichment" }, { status: 500 });
  }
}
