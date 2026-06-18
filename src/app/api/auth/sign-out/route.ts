import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/core/supabase/server";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL));
}
