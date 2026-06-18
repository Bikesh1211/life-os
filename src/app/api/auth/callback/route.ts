import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const errorCode = searchParams.get("error_code");
  const redirectTo = searchParams.get("redirect_url") || "/";

  if (error) {
    const signInUrl = new URL("/sign-in", origin);
    signInUrl.searchParams.set("error", error);
    if (errorDescription) {
      signInUrl.searchParams.set("error_description", errorDescription);
    }
    if (errorCode) {
      signInUrl.searchParams.set("error_code", errorCode);
    }
    return NextResponse.redirect(signInUrl);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const response = NextResponse.redirect(`${origin}${redirectTo}`);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.exchangeCodeForSession(code);

  return response;
}
