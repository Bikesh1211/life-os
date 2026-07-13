import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import type { LoanFiltersParams } from "@/modules/loans/service";
import {
  createLoan,
  getLoans,
} from "@/modules/loans/service";

export async function GET(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const direction = searchParams.get("direction") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const sortBy = searchParams.get("sortBy") ?? undefined;
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 50;
    const offset = searchParams.get("offset") ? Number(searchParams.get("offset")) : 0;
    const includeArchived = searchParams.get("includeArchived") === "true";

    const loans = await getLoans(userId, {
      direction: direction as "lent" | "borrowed" | undefined,
      status: (status ?? undefined) as LoanFiltersParams["status"],
      search,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
      limit,
      offset,
      includeArchived,
    });

    return NextResponse.json({ loans, total: loans.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    const details = error instanceof Error ? error.stack ?? undefined : undefined;
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message, details } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });

  try {
    const body = await req.json();
    const loan = await createLoan(userId, body);
    return NextResponse.json(loan, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid request";
    const details = error instanceof Error ? error.stack ?? undefined : undefined;
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message, details } }, { status: 400 });
  }
}
