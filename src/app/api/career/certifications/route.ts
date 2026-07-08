import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getCertifications, createCertification, createCertificationSchema } from "@/modules/career";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const certifications = await getCertifications(userId);
    return NextResponse.json(certifications);
  } catch {
    return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createCertificationSchema.parse(body);
    const certification = await createCertification(userId, parsed);
    return NextResponse.json(certification, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create certification" }, { status: 500 });
  }
}
