import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { exportCSV } from "@/modules/time-audit";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    if (!dateFrom || !dateTo) {
      return NextResponse.json({ error: "dateFrom and dateTo are required" }, { status: 400 });
    }

    const csv = await exportCSV(userId, dateFrom, dateTo);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="time-audit-${dateFrom}-${dateTo}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to export report" }, { status: 500 });
  }
}
