import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/core/auth";

export async function POST() {
  const response = NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  const cookieStore = await import("next/headers").then(m => m.cookies());
  cookieStore.delete("session_token");
  return response;
}
