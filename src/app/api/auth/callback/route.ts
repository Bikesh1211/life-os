import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const requested = searchParams.get("redirect_url");
  const redirectTo =
    requested && /^\/(?![/\\])/.test(requested) ? requested : "/";

  const error = searchParams.get("error");
  if (error) {
    const signInUrl = new URL("/sign-in", origin);
    signInUrl.searchParams.set("error", error);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
