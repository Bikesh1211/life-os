import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import {
  createExpenseBudget,
  getBudgetsWithSpending,
} from "@/modules/expenses/service/budgets";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

  const budgets = await getBudgetsWithSpending(userId);
  return NextResponse.json(budgets);
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

  try {
    const body = await req.json();
    const budget = await createExpenseBudget(userId, body);
    return NextResponse.json(budget, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}
