import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import {
  getExpenseTransaction,
  updateExpenseTransaction,
  deleteExpenseTransaction,
} from "@/modules/expenses/service/transactions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

  const { id } = await params;
  const transaction = await getExpenseTransaction(id, userId);
  if (!transaction) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Transaction not found" } }, { status: 404 });

  return NextResponse.json(transaction);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const transaction = await updateExpenseTransaction(id, userId, body);
    if (!transaction) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Transaction not found" } }, { status: 404 });
    return NextResponse.json(transaction);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

  const { id } = await params;
  const transaction = await deleteExpenseTransaction(id, userId);
  if (!transaction) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Transaction not found" } }, { status: 404 });

  return new NextResponse(null, { status: 204 });
}
