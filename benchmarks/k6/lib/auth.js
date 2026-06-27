import http from "k6/http";

export function login(config) {
  const { supabaseUrl, supabaseAnonKey, email, password } = config;

  if (!supabaseUrl || !email || !password) {
    console.error(
      "Missing Supabase auth config. Set NEXT_PUBLIC_SUPABASE_URL, BENCHMARK_EMAIL, and BENCHMARK_PASSWORD."
    );
    return null;
  }

  const url = `${supabaseUrl}/auth/v1/token?grant_type=password`;
  const payload = JSON.stringify({ email, password });
  const headers = {
    "Content-Type": "application/json",
    apikey: supabaseAnonKey || "",
  };

  const res = http.post(url, payload, { headers });

  if (res.status !== 200) {
    console.error(
      `Supabase login failed (${res.status}): ${res.body}`
    );
    return null;
  }

  const body = JSON.parse(res.body);

  const hasSession =
    body.access_token && body.refresh_token;

  if (!hasSession) {
    return null;
  }

  return {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    expires_in: body.expires_in,
    userId: body.user.id,
  };
}

export function makeSessionCookieHeader(session) {
  if (!session) return {};
  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}
