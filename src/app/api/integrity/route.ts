import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getCommitments, createCommitment, createCommitmentSchema, getDashboard } from "@/modules/integrity";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    if (view === "dashboard") {
      const dashboard = await getDashboard(userId);
      return NextResponse.json(dashboard);
    }

    const status = searchParams.get("status") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const difficulty = searchParams.get("difficulty") ?? undefined;
    const priority = searchParams.get("priority") ?? undefined;
    const commitments = await getCommitments(userId, status, category, difficulty, priority);
    return NextResponse.json(commitments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch commitments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createCommitmentSchema.parse(body);
    const commitment = await createCommitment(userId, parsed);
    return NextResponse.json(commitment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create commitment" }, { status: 500 });
  }
}
