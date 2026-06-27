import http from "k6/http";
import { check } from "k6";
import { Rate, Trend } from "k6/metrics";
import { login, makeSessionCookieHeader } from "./lib/auth.js";
import { parseTimeout, randomItem } from "./lib/helpers.js";

const ROUTES = (() => {
  try {
    return JSON.parse(open("../routes.json"));
  } catch (e) {
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

const TARGET_VUS = __ENV.VUS ? parseInt(__ENV.VUS, 10) : 50;
const BASE_URL = __ENV.BENCHMARK_BASE_URL || "http://localhost:3000";
const TIMEOUT = __ENV.BENCHMARK_TIMEOUT || "30s";

const routes = ROUTES.routes || [];

const loadErrors = new Rate("load_errors");
const loadDuration = new Trend("load_duration");

export const options = {
  scenarios: {
    soak: {
      executor: "ramping-arrival-rate",
      startRate: 10,
      timeUnit: "1s",
      preAllocatedVUs: TARGET_VUS,
      maxVUs: TARGET_VUS * 2,
      stages: [
        { duration: "2m", target: 50 },
        { duration: "5m", target: 50 },
        { duration: "2m", target: 100 },
        { duration: "5m", target: 100 },
        { duration: "2m", target: 200 },
        { duration: "5m", target: 200 },
        { duration: "2m", target: 0 },
      ],
    },
  },
  thresholds: {
    load_errors: ["rate<0.05"],
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
    ? JSON.stringify({ _benchmark: true, title: "Load Test " + Date.now() })
    : null;

  var res = http.request(route.method, url, body, {
    headers: headers,
    timeout: parseTimeout(TIMEOUT),
  });

  loadDuration.add(res.timings.duration, { endpoint: route.label });
  loadErrors.add(res.status >= 400 && res.status !== 404);

  check(res, { "status ok": function (r) { return r.status < 500; } });
}
