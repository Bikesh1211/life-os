import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getCertificationById, updateCertification, deleteCertification, updateCertificationSchema } from "@/modules/career";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const cert = await getCertificationById(userId, id);
    if (!cert) return NextResponse.json({ error: "Certification not found" }, { status: 404 });
    return NextResponse.json(cert);
  } catch {
    return NextResponse.json({ error: "Failed to fetch certification" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCertificationSchema.parse(body);
    const cert = await updateCertification(userId, id, parsed);
    if (!cert) return NextResponse.json({ error: "Certification not found" }, { status: 404 });
    return NextResponse.json(cert);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update certification" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const cert = await deleteCertification(userId, id);
    if (!cert) return NextResponse.json({ error: "Certification not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete certification" }, { status: 500 });
  }
}
