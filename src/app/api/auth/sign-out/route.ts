import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/core/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("session_token");
  const cookieStore = await import("next/headers").then(m => m.cookies());
  cookieStore.delete("session_token");
  await clearSessionCookie();
  return response;
}
