import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { pickField, pickFieldSchema } from "@/modules/field-roadmap";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { slug } = pickFieldSchema.parse(body);
    const roadmap = await pickField(userId, slug);
    return NextResponse.json(roadmap);
  } catch {
    return NextResponse.json({ error: "Failed to start roadmap" }, { status: 400 });
  }
}