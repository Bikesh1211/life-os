import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = (req: NextRequest) => {
  const path = req.nextUrl.pathname;
  return (
    path.startsWith("/sign-in") ||
    path.startsWith("/sign-up") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/api")
  );
};

export const proxy = async (req: NextRequest) => {
  const res = NextResponse.next();

  if (isPublicRoute(req)) {
    return res;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  return res;
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|manifest\\.webmanifest|sw\\.js|icon-.*\\.png|icon\\.svg).*)",
  ],
};
