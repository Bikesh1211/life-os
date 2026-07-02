import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import { getSubscriptionTransactions } from "@/modules/expenses/service/transactions";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

  const subscriptions = await getSubscriptionTransactions(userId);
  return NextResponse.json(subscriptions);
}
