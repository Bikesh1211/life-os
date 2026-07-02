import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import {
  createExpenseTransaction,
  getExpenseTransactions,
  defaultTransactionFilters,
} from "@/modules/expenses/service/transactions";

export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const accountId = searchParams.get("accountId") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;
  const offset = searchParams.get("offset") ? Number(searchParams.get("offset")) : 0;

  const filters = defaultTransactionFilters(userId, {
    type,
    categoryId,
    accountId,
    search,
    limit,
    offset,
  });

  const transactions = await getExpenseTransactions(filters);
  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

  try {
    const body = await req.json();
    const transaction = await createExpenseTransaction(userId, body);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}
