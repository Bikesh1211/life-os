import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTemplates, seedTemplates, cloneTemplate } from "@/modules/routines";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const templates = await seedTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const templateId = body.templateId;
    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }
    const routine = await cloneTemplate(templateId, userId);
    if (!routine) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to clone template" }, { status: 500 });
  }
}
