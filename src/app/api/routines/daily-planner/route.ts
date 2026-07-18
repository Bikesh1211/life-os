import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/core/auth";
import {
  getDailyPlannerData,
  setDailyGoal,
  toggleDailyGoal,
  addDailyPriority,
  updateDailyPriorityStatus,
  removeDailyPriority,
  saveDailyNote,
  computeProductivityScore,
} from "@/modules/routines";

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

  const data = await getDailyPlannerData(userId, date);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action, date, ...params } = body;

  if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

  switch (action) {
    case "setGoal": {
      const goal = await setDailyGoal(userId, date, params);
      return NextResponse.json(goal);
    }
    case "toggleGoal": {
      const result = await toggleDailyGoal(params.id, userId, params.isCompleted);
      return NextResponse.json(result);
    }
    case "addPriority": {
      const priority = await addDailyPriority(userId, date, params);
      return NextResponse.json(priority);
    }
    case "updatePriority": {
      const updated = await updateDailyPriorityStatus(params.id, userId, params.status);
      return NextResponse.json(updated);
    }
    case "removePriority": {
      await removeDailyPriority(params.id, userId);
      return NextResponse.json({ success: true });
    }
    case "saveNote": {
      const note = await saveDailyNote(userId, date, params);
      return NextResponse.json(note);
    }
    case "computeScore": {
      const score = await computeProductivityScore(userId, date);
      return NextResponse.json(score);
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
