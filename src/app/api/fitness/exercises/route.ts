import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import { getExerciseLibrary } from "@/modules/fitness";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      muscleGroup: searchParams.get("muscleGroup") ?? undefined,
      equipment: searchParams.get("equipment") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    };
    const exercises = await getExerciseLibrary(filters);
    return NextResponse.json(exercises);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}
