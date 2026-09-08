import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/core/auth";

const isPublicRoute = (req: NextRequest) => {
  const path = req.nextUrl.pathname;
  return (
    path.startsWith("/sign-in") ||
    path.startsWith("/sign-up") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/api") ||
    path === "/theme.css"
  );
};

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  if (isPublicRoute(req)) {
    return res;
  }

  const token = req.cookies.get("session_token")?.value;

  if (!token) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  const session = verifySessionToken(token);
  if (!session) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
    const response = NextResponse.redirect(signInUrl);
    response.cookies.delete("session_token");
    return response;
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|manifest\\.webmanifest|sw\\.js|icon-.*\\.png|icon\\.svg).*)",
  ],
};
