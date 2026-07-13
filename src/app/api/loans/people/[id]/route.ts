import { getCurrentUserId } from "@/core/auth";
import { NextResponse } from "next/server";
import { getPersonLoanSummary } from "@/modules/loans/service";
import { getConnection } from "@/modules/network/service";
import { getLoansByConnectionId } from "@/modules/loans/repository/loans";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id: connectionId } = await params;

  const [connection, loanSummary] = await Promise.all([
    getConnection(connectionId, userId),
    getPersonLoanSummary(connectionId, userId),
  ]);

  if (!connection) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json({
    id: connection.id,
    name: connection.name,
    phone: connection.phone,
    email: connection.email,
    profilePictureUrl: connection.profilePictureUrl,
    ...loanSummary,
  });
}
