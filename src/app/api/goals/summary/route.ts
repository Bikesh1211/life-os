import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/core/database";
import { goals } from "@/modules/goals/schema";
import { eq, count, and, isNull } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [totalResult] = await db
      .select({ value: count() })
      .from(goals)
      .where(and(eq(goals.userId, userId), isNull(goals.deletedAt)));

    const [activeResult] = await db
      .select({ value: count() })
      .from(goals)
      .where(
        and(
          eq(goals.userId, userId),
          eq(goals.status, "active" as any),
          isNull(goals.deletedAt),
        ),
      );

    const [completedResult] = await db
      .select({ value: count() })
      .from(goals)
      .where(
        and(
          eq(goals.userId, userId),
          eq(goals.status, "completed" as any),
          isNull(goals.deletedAt),
        ),
      );

    return NextResponse.json({
      total: Number(totalResult?.value ?? 0),
      active: Number(activeResult?.value ?? 0),
      completed: Number(completedResult?.value ?? 0),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}
