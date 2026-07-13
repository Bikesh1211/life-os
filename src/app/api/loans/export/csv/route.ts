import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import { getLoans } from "@/modules/loans/service";
import { getRepaymentsByLoanId } from "@/modules/loans/repository/repayments";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const allLoans = await getLoans(userId, { limit: 200, includeArchived: true });
  const rows: string[] = [
    "ID,Direction,Amount,Currency,Status,Due Date,Purpose,Notes,Total Paid,Remaining",
  ];

  for (const loan of allLoans) {
    const repayments = await getRepaymentsByLoanId(loan.id);
    const totalPaid = repayments.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalPayable = Number(loan.totalPayable ?? loan.principalAmount);

    rows.push([
      loan.id,
      loan.direction,
      loan.principalAmount,
      loan.currency,
      loan.status,
      loan.dueDate?.toISOString() ?? "",
      `"${(loan.purpose ?? "").replace(/"/g, '""')}"`,
      `"${(loan.notes ?? "").replace(/"/g, '""')}"`,
      String(totalPaid),
      String(Math.max(0, totalPayable - totalPaid)),
    ].join(","));
  }

  const csv = rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=loans-export.csv",
    },
  });
}
