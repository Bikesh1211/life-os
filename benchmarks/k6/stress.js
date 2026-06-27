import http from "k6/http";
import { check } from "k6";
import { Rate, Trend } from "k6/metrics";
import { login, makeSessionCookieHeader } from "./lib/auth.js";
import { parseTimeout, randomItem } from "./lib/helpers.js";

const ROUTES = (() => {
  try {
    return JSON.parse(open("../routes.json"));
  } catch (e) {
    console.error("Failed to load routes.json. Run `npm run discover-routes` first.");
    return { routes: [] };
  }
})();

const PARAMS = (() => {
  try {
    return JSON.parse(open("../route-params.json"));
  } catch (e) {
    return {};
  }
})();

const BASE_URL = __ENV.BENCHMARK_BASE_URL || "http://localhost:3000";
const TIMEOUT = __ENV.BENCHMARK_TIMEOUT || "30s";

const routes = ROUTES.routes || [];

const stressErrors = new Rate("stress_errors");
const stressDuration = new Trend("stress_duration");

export const options = {
  scenarios: {
    stress_ramp: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 10 },
        { duration: "30s", target: 50 },
        { duration: "1m", target: 50 },
        { duration: "30s", target: 100 },
        { duration: "1m", target: 100 },
        { duration: "30s", target: 500 },
        { duration: "1m", target: 500 },
        { duration: "30s", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    stress_errors: ["rate<0.05"],
    http_req_duration: ["p(95)<10000"],
  },
};

export function setup() {
  const session = login({
    supabaseUrl: __ENV.NEXT_PUBLIC_SUPABASE_URL || "",
    supabaseAnonKey: __ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    email: __ENV.BENCHMARK_EMAIL || "",
    password: __ENV.BENCHMARK_PASSWORD || "",
  });
  return { session, params: PARAMS };
}

function resolveUrl(route, params) {
  let url = BASE_URL + route.path;
  if (route.hasParams && params) {
    for (const paramName of route.paramNames) {
      var source = params[route.path] || params[route.path.replace(/\/:[^/]+$/, "/:" + paramName)];
      var id = source ? source[paramName] : "00000000-0000-0000-0000-000000000000";
      url = url.replace(":" + paramName, id);
    }
  }
  return url;
}

export default function (data) {
  var route = routes[Math.floor(Math.random() * routes.length)];
  var url = resolveUrl(route, data.params);
  var headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...makeSessionCookieHeader(data.session),
  };

  var body = route.method === "POST" || route.method === "PATCH" || route.method === "PUT"
    ? JSON.stringify({ _benchmark: true, title: "Stress Test " + Date.now() })
    : null;

  var res = http.request(route.method, url, body, {
    headers: headers,
    timeout: parseTimeout(TIMEOUT),
  });

  stressDuration.add(res.timings.duration, { endpoint: route.label });
  stressErrors.add(res.status >= 400 && res.status !== 404);

  check(res, { "status ok": function (r) { return r.status < 500; } });
}
