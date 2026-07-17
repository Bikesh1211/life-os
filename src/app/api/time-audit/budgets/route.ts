import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getBudgets, createBudget, getBudgetProgress } from "@/modules/time-audit";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("includeProgress") === "true") {
      const progress = await getBudgetProgress(userId);
      return NextResponse.json(progress);
    }
    const budgets = await getBudgets(userId);
    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const budget = await createBudget(userId, body);
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors ?? error.message },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to create budget" }, { status: 500 });
  }
}
