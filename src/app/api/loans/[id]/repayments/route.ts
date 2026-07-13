import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import { addRepayment, getRepayments } from "@/modules/loans/service";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const repayments = await getRepayments(id);
  return NextResponse.json(repayments);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const repayment = await addRepayment(userId, id, body);
    return NextResponse.json(repayment, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}
