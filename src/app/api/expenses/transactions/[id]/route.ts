import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getExpenseTransaction,
  updateExpenseTransaction,
  deleteExpenseTransaction,
} from "@/modules/expenses/service/transactions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const transaction = await getExpenseTransaction(id, userId);
  if (!transaction) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(transaction);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const transaction = await updateExpenseTransaction(id, userId, body);
    if (!transaction) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json(transaction);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const transaction = await deleteExpenseTransaction(id, userId);
  if (!transaction) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(null, { status: 204 });
}
