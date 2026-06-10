import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getEntrySubjects } from "@/modules/knowledge";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subjects = await getEntrySubjects(userId);
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}
