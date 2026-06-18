import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import {
  createExpenseBudget,
  getBudgetsWithSpending,
} from "@/modules/expenses/service/budgets";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const budgets = await getBudgetsWithSpending(userId);
  return NextResponse.json(budgets);
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const budget = await createExpenseBudget(userId, body);
    return NextResponse.json(budget, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
