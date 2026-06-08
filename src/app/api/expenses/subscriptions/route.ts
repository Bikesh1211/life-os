import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSubscriptionTransactions } from "@/modules/expenses/service/transactions";

export async function GET() {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const subscriptions = await getSubscriptionTransactions(userId);
  return NextResponse.json(subscriptions);
}
