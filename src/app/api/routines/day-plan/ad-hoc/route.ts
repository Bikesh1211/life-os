import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdhocItem } from "@/modules/routines";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const item = await createAdhocItem(userId, body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    if (error?.message?.includes("overlaps")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create ad-hoc item" }, { status: 500 });
  }
}
