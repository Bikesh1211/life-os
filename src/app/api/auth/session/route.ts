import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/core/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/user";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session?.userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await connectToDatabase();
    const user = await UserModel.findById(session.userId).select("email fullName avatarUrl").lean();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
