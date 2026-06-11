import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getFinancialAccount,
  updateFinancialAccount,
  deleteFinancialAccount,
  adjustAccountBalance,
} from "@/modules/expenses/service/accounts";
import { createExpenseTransaction } from "@/modules/expenses/service/transactions";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const account = await getFinancialAccount(id, userId);
  if (!account) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(account);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    const { adjustmentAmount, ...updateData } = body;

    if (adjustmentAmount) {
      const account = await getFinancialAccount(id, userId);
      if (!account) return new NextResponse("Not found", { status: 404 });

      const newBalance = String(Number(account.balance) + Number(adjustmentAmount));
      await adjustAccountBalance(id, userId, newBalance);

      await createExpenseTransaction(userId, {
        amount: String(Math.abs(Number(adjustmentAmount))),
        type: Number(adjustmentAmount) > 0 ? "income" : "expense",
        currency: "NPR",
        merchant: "Balance adjustment",
        description: `Adjusted balance for ${account.name}`,
        accountId: id,
        transactionDate: new Date().toISOString(),
      });

      const updated = await getFinancialAccount(id, userId);
      return NextResponse.json(updated);
    }

    const account = await updateFinancialAccount(id, userId, updateData);
    if (!account) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json(account);
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
  const account = await deleteFinancialAccount(id, userId);
  if (!account) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(null, { status: 204 });
}
