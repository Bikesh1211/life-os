import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getApplications, createApplication, createApplicationSchema } from "@/modules/career";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const applications = await getApplications(userId, status);
    return NextResponse.json(applications);
  } catch {
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createApplicationSchema.parse(body);
    const application = await createApplication(userId, parsed);
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
