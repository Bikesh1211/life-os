import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";

import { getGoalConfigs } from "@/modules/music";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const configs = await getGoalConfigs(userId);

    const goals = configs.map((c: any) => ({
      id: c.id,
      label: `${c.targetCount ?? 0} ${c.targetType}`,
      current: c.currentCount ?? 0,
      target: c.targetCount ?? 1,
      unit: c.targetType ?? "items",
    }));

    return NextResponse.json({ goals });
  } catch {
    return NextResponse.json({ error: "Failed to load goals" }, { status: 500 });
  }
}
