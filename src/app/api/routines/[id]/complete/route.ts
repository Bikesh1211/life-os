import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getExecutionDetails, completeExecution, skipExecution } from "@/modules/routines";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const { executionId, action } = body;

    if (!executionId) {
      return NextResponse.json({ error: "executionId is required" }, { status: 400 });
    }

    let execution;
    if (action === "skip") {
      execution = await skipExecution(executionId, userId);
    } else {
      execution = await completeExecution(executionId, userId);
    }

    if (!execution) {
      return NextResponse.json({ error: "Execution not found" }, { status: 404 });
    }

    const details = await getExecutionDetails(execution.id, userId);
    return NextResponse.json(details);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update routine" }, { status: 500 });
  }
}
