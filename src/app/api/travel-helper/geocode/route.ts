import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    if (!q || !q.trim()) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    const res = await fetch(
      `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
      { headers: { "User-Agent": "LifeOS-TravelHelper/1.0" } },
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Geocoding service error" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
