import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import {
  createFinancialAccount,
  getFinancialAccounts,
} from "@/modules/expenses/service/accounts";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error("API /expenses/accounts: Unauthorized - No userId");
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  try {
    const accounts = await getFinancialAccounts(userId);
    console.log("API /expenses/accounts: Successfully fetched accounts", accounts);
    return NextResponse.json(accounts);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch accounts";
    console.error("API /expenses/accounts: Error fetching accounts", error);
    return NextResponse.json({ error: { code: "INTERNAL_SERVER_ERROR", message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

  try {
    const body = await req.json();
    const account = await createFinancialAccount(userId, body);
    return NextResponse.json(account, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}
