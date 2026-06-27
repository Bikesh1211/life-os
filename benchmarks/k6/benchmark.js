import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import { login, makeSessionCookieHeader } from "./lib/auth.js";
import { parseFloat } from "./lib/helpers.js";

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

const TARGET_VUS = __ENV.VUS ? parseInt(__ENV.VUS, 10) : 10;
const REQUESTS_PER_ROUTE = __ENV.REQUESTS_PER_ROUTE
  ? parseInt(__ENV.REQUESTS_PER_ROUTE, 10)
  : 100;
const BASE_URL = __ENV.BENCHMARK_BASE_URL || "http://localhost:3000";
const TIMEOUT = __ENV.BENCHMARK_TIMEOUT || "30s";

const routes = ROUTES.routes || [];

const endpointDuration = new Trend("endpoint_duration", true);
const endpointErrors = new Rate("endpoint_errors", true);
const endpointTimeouts = new Rate("endpoint_timeouts", true);
const totalRequests = new Counter("total_requests");

export const options = {
  scenarios: {
    benchmark: {
      executor: "shared-iterations",
      vus: TARGET_VUS,
      iterations: Math.max(routes.length * REQUESTS_PER_ROUTE, 100),
      maxDuration: "30m",
    },
  },
  thresholds: {
    endpoint_errors: ["rate<0.01"],
    http_req_duration: ["p(95)<5000"],
  },
};

export function setup() {
  const session = login({
    supabaseUrl: __ENV.NEXT_PUBLIC_SUPABASE_URL || "",
    supabaseAnonKey: __ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    email: __ENV.BENCHMARK_EMAIL || "",
    password: __ENV.BENCHMARK_PASSWORD || "",
  });

  if (!session) {
    console.warn(
      "WARNING: Auth login failed. Running unauthenticated — all 401 routes will report errors."
    );
  }

  return { session, routes, params: PARAMS };
}

function resolveUrl(route, params) {
  let url = `${BASE_URL}${route.path}`;

  if (route.hasParams && params) {
    for (const paramName of route.paramNames) {
      const pattern = `${route.path.replace(/\/:[^/]+/g, "")}/:${paramName}`;
      const paramSource = params[pattern] || params[`${route.path}`];

      if (paramSource && paramSource[paramName]) {
        url = url.replace(`:${paramName}`, paramSource[paramName]);
      } else {
        url = url.replace(`:${paramName}`, "00000000-0000-0000-0000-000000000000");
      }
    }
  }

  return url;
}

function getRequestBody(route) {
  if (route.method === "POST" || route.method === "PATCH" || route.method === "PUT") {
    return JSON.stringify({
      _benchmark: true,
      title: "Benchmark Test Entry",
      timestamp: Date.now().toString(),
    });
  }
  return null;
}

export default function (data) {
  const { session, params } = data;
  const route = routes[__ITER % routes.length];

  const url = resolveUrl(route, params);
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...makeSessionCookieHeader(session),
  };

  const body = getRequestBody(route);
  const timeoutMs = parseTimeout(TIMEOUT);

  const res = http.request(route.method, url, body, {
    headers,
    timeout: timeoutMs,
  });

  endpointDuration.add(res.timings.duration, {
    endpoint: route.label,
    method: route.method,
    path: route.path,
  });

  const isError = res.status >= 400 && res.status !== 404;
  endpointErrors.add(isError, {
    endpoint: route.label,
    status: res.status,
  });

  totalRequests.add(1);

  if (res.status === 0) {
    endpointTimeouts.add(1, { endpoint: route.label });
  }

  check(res, {
    [`${route.label} status < 500`]: (r) => r.status < 500,
  });
}

function parseTimeout(val) {
  if (typeof val === "number") return val * 1000;
  const match = val.match(/^(\d+)s$/);
  return match ? parseInt(match[1], 10) * 1000 : 30000;
}
