import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { travelService } from "@/modules/travel";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const trips = await travelService.getTrips(userId);
    return NextResponse.json(trips);
  } catch {
    return NextResponse.json({ error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const trip = await travelService.createTrip(userId, body);
    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
