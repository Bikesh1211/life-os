import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import { getLoan, updateLoan, deleteLoan } from "@/modules/loans/service";
import { getTotalPaidForLoan } from "@/modules/loans/repository/repayments";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const loan = await getLoan(id, userId);
  if (!loan) return new NextResponse("Not found", { status: 404 });

  const totalPayable = Number(loan.totalPayable ?? loan.principalAmount);
  const paidAmount = await getTotalPaidForLoan(id);
  const remainingAmount = Math.max(0, totalPayable - paidAmount);
  const completionPercentage = totalPayable > 0 ? Math.round((paidAmount / totalPayable) * 100) : 0;
  const isOverdue = Boolean(
    loan.dueDate &&
    new Date(loan.dueDate) < new Date() &&
    (loan.status === "active" || loan.status === "partially_paid"),
  );

  return NextResponse.json({
    ...loan,
    paidAmount: String(paidAmount),
    remainingAmount: String(remainingAmount),
    completionPercentage,
    isOverdue,
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const loan = await updateLoan(id, userId, body);
    if (!loan) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json(loan);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const loan = await deleteLoan(id, userId);
  if (!loan) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({ success: true });
}
