import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSetup, getSetups } from "@/modules/tech-gear/service/index";

export async function GET() {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const setups = await getSetups(userId);
    return NextResponse.json(setups);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch setups" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authResult = await auth();
  const userId = authResult.userId;
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
