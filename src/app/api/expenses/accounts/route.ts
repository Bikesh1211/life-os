import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import {
  createFinancialAccount,
  getFinancialAccounts,
} from "@/modules/expenses/service/accounts";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const accounts = await getFinancialAccounts(userId);
  return NextResponse.json(accounts);
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const account = await createFinancialAccount(userId, body);
    return NextResponse.json(account, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
