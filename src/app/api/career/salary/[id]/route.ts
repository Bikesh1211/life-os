import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getSalaryRecordById, updateSalaryRecord, deleteSalaryRecord, updateSalaryRecordSchema } from "@/modules/career";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const record = await getSalaryRecordById(userId, id);
    if (!record) return NextResponse.json({ error: "Salary record not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "Failed to fetch salary record" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSalaryRecordSchema.parse(body);
    const record = await updateSalaryRecord(userId, id, parsed);
    if (!record) return NextResponse.json({ error: "Salary record not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update salary record" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const record = await deleteSalaryRecord(userId, id);
    if (!record) return NextResponse.json({ error: "Salary record not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete salary record" }, { status: 500 });
  }
}
