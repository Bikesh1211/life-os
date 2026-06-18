import { NextResponse } from "next/server";
import { calculateBmi } from "@/modules/wellness";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = calculateBmi(body.heightCm, body.weightKg);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: (error as any).errors ?? error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to calculate BMI" }, { status: 500 });
  }
}
