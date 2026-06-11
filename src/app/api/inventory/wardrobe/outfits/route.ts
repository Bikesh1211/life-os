import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createOutfit, getOutfits } from "@/modules/wardrobe/service/index";

export async function GET() {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const outfits = await getOutfits(userId);
    return NextResponse.json(outfits);
  } catch (error) {
    console.error("Error fetching outfits:", error);
    return NextResponse.json({ error: "Failed to fetch outfits" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const outfit = await createOutfit(userId, body);
    return NextResponse.json(outfit, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create outfit" }, { status: 500 });
  }
}
