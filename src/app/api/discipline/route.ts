import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import {
  getDisciplineDashboard,
  getCommitments,
  createCommitment,
  createCommitmentSchema,
} from "@/modules/integrity";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");

    if (view === "dashboard") {
      const period = searchParams.get("period") ?? "today";
      const dashboard = await getDisciplineDashboard(userId, period);
      return NextResponse.json(dashboard);
    }

    const status = searchParams.get("status") ?? undefined;
    const commitments = await getCommitments(userId, status);
    return NextResponse.json(commitments);
  } catch (error) {
    console.error("Discipline dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch discipline data" }, { status: 500 });
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
