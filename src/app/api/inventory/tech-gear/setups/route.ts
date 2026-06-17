import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { createSetup, getSetups } from "@/modules/tech-gear/service/index";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const setups = await getSetups(userId);
    return NextResponse.json(setups);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch setups" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const setup = await createSetup(userId, body);
    return NextResponse.json(setup, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: error.message || "Failed to create setup" }, { status: 500 });
  }
}
