import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getExecutionDetails, startExecution } from "@/modules/routines";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    const executionId = body.executionId;

    if (!executionId) {
      return NextResponse.json({ error: "executionId is required" }, { status: 400 });
    }

    const execution = await startExecution(executionId, userId);
    if (!execution) {
      return NextResponse.json({ error: "Execution not found" }, { status: 404 });
    }

    const details = await getExecutionDetails(execution.id, userId);
    return NextResponse.json(details);
  } catch (error) {
    return NextResponse.json({ error: "Failed to start routine" }, { status: 500 });
  }
}
