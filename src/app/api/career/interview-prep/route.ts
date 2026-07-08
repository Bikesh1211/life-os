import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getInterviewPrepItems, createInterviewPrep, createInterviewPrepSchema } from "@/modules/career";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId") ?? undefined;
    const items = await getInterviewPrepItems(userId, applicationId);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch interview prep items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = createInterviewPrepSchema.parse(body);
    const item = await createInterviewPrep(userId, parsed);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create interview prep item" }, { status: 500 });
  }
}
