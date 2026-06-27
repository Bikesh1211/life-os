import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

interface RawMetric {
  type: string;
  metric: string;
  data: {
    type?: string;
    value?: number;
    values?: Record<string, number>;
    rate?: number;
    count?: number;
    ratePerSec?: number;
    tags?: Record<string, string>;
  };
}

interface ParsedEndpoint {
  label: string;
  method: string;
  path: string;
  avg: number;
  median: number;
  p90: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  rps: number;
  successRate: number;
  errorRate: number;
  timeoutRate: number;
  totalRequests: number;
  failedRequests: number;
  issues?: string[];
  slowestEndpoint?: boolean;
  fastestEndpoint?: boolean;
}

const RESULTS_DIR = join(process.cwd(), "benchmarks/results");

const SLOW_AVG_THRESHOLD = parseInt(process.env.BENCHMARK_AVG_THRESHOLD_MS ?? "200", 10);
const SLOW_P95_THRESHOLD = parseInt(process.env.BENCHMARK_P95_THRESHOLD_MS ?? "500", 10);
const HIGH_ERROR_THRESHOLD = parseFloat(process.env.BENCHMARK_ERROR_THRESHOLD_PCT ?? "1");

function parseK6Summary(filePath: string): { endpoints: ParsedEndpoint[]; coldBootMs?: number } {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter(Boolean);

  const metrics: RawMetric[] = lines.map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  }).filter(Boolean);

  const durations = new Map<string, number[]>();
  const errors = new Map<string, number>();
  const timeouts = new Map<string, number>();
  const counts = new Map<string, number>();
  const methods = new Map<string, string>();
  const paths = new Map<string, string>();

  for (const m of metrics) {
    if (m.type === "Point" && m.metric === "endpoint_duration") {
      const endpoint = m.data.tags?.endpoint || "unknown";
      if (!durations.has(endpoint)) durations.set(endpoint, []);
      durations.get(endpoint)!.push(m.data.value);
      methods.set(endpoint, m.data.tags?.method || "");
      paths.set(endpoint, m.data.tags?.path || "");
    }

    if (m.type === "Rate" && m.metric === "endpoint_errors") {
      const endpoint = m.data.tags?.endpoint || "unknown";
      errors.set(endpoint, m.data.rate || 0);
      counts.set(endpoint, m.data.count || 0);
    }

    if (m.type === "Rate" && m.metric === "endpoint_timeouts") {
      const endpoint = m.data.tags?.endpoint || "unknown";
      timeouts.set(endpoint, m.data.rate || 0);
    }
  }

  // Aggregate http_req metrics for overall stats
  let coldBootMs: number | undefined;
  for (const m of metrics) {
    if (m.type === "Point" && m.metric === "http_req_duration") {
      if (!coldBootMs || m.data.value! > coldBootMs) {
        coldBootMs = m.data.value;
      }
    }
  }

  const endpoints: ParsedEndpoint[] = [];

  durations.forEach((durs, label) => {
    if (durs.length === 0) return;

    const sorted = [...durs].sort((a, b) => a - b);
    const total = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    const avg = sum / total;
    const median = percentile(sorted, 50);
    const p90 = percentile(sorted, 90);
    const p95 = percentile(sorted, 95);
    const p99 = percentile(sorted, 99);
    const min = sorted[0];
    const max = sorted[total - 1];

    const errorRate = (errors.get(label) ?? 0) * 100;
    const timeoutRate = (timeouts.get(label) ?? 0) * 100;

    endpoints.push({
      label,
      method: methods.get(label) ?? "",
      path: paths.get(label) ?? "",
      avg,
      median,
      p90,
      p95,
      p99,
      min,
      max,
      rps: total / (durs.length > 1 ? (sorted[total - 1] - sorted[0]) / 1000 : 1),
      successRate: 100 - errorRate,
      errorRate,
      timeoutRate,
      totalRequests: total,
      failedRequests: Math.round((errorRate / 100) * total),
    });
  });

  return { endpoints, coldBootMs };
}

function percentile(sorted: number[], p: number): number {
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function determineIssues(ep: ParsedEndpoint): string[] {
  const issues: string[] = [];
  if (ep.avg > SLOW_AVG_THRESHOLD) {
    issues.push(`High avg latency (${ep.avg.toFixed(0)}ms > ${SLOW_AVG_THRESHOLD}ms) — check DB query perf, add indexing`);
  }
  if (ep.p95 > SLOW_P95_THRESHOLD) {
    issues.push(`High P95 (${ep.p95.toFixed(0)}ms > ${SLOW_P95_THRESHOLD}ms) — consider caching, connection pooling`);
  }
  if (ep.errorRate > HIGH_ERROR_THRESHOLD) {
    issues.push(`Error rate ${ep.errorRate.toFixed(1)}% > ${HIGH_ERROR_THRESHOLD}% — investigate failures`);
  }
  if (ep.avg > 1000) {
    issues.push("Extreme avg latency — likely sequential async ops or unoptimized N+1 queries");
  }
  if (ep.method === "GET" && ep.avg > 100) {
    issues.push("Slow GET — add response caching (Redis or CDN), check for missing indexes");
  }
  return issues;
}

function generateReport(inputPath: string): void {
  if (!existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    console.error("Run k6 first with --summary-export to generate the input.");
    process.exit(1);
  }

  if (!existsSync(RESULTS_DIR)) {
    mkdirSync(RESULTS_DIR, { recursive: true });
  }

  const { endpoints, coldBootMs } = parseK6Summary(inputPath);

  if (endpoints.length === 0) {
    console.error("No endpoint metrics found in the summary. Check --summary-export format.");
    process.exit(1);
  }

  // Sort by avg response time
  const sorted = [...endpoints].sort((a, b) => a.avg - b.avg);
  const slowest = sorted[sorted.length - 1];
  const fastest = sorted[0];

  // Annotate slowest/fastest
  for (const ep of sorted) {
    ep.slowestEndpoint = ep.label === slowest.label;
    ep.fastestEndpoint = ep.label === fastest.label;
  }

  // Generate issues
  const withIssues = sorted.map((ep) => ({
    ...ep,
    issues: determineIssues(ep),
  }));

  // Slow endpoints
  const slowEndpoints = withIssues.filter(
    (ep) => ep.avg > SLOW_AVG_THRESHOLD || ep.p95 > SLOW_P95_THRESHOLD || ep.errorRate > HIGH_ERROR_THRESHOLD
  );

  // ── Terminal Summary ──
  const termWidth = 80;
  console.log("\n" + "─".repeat(termWidth));
  console.log("  API BENCHMARK RESULTS");
  console.log("─".repeat(termWidth));

  if (coldBootMs) {
    console.log(`  Coldest request:  ${coldBootMs.toFixed(0)}ms`);
  }
  console.log(`  Endpoints tested: ${endpoints.length}`);
  console.log(`  Fastest:          ${fastest.label} (${fastest.avg.toFixed(0)}ms avg)`);
  console.log(`  Slowest:          ${slowest.label} (${slowest.avg.toFixed(0)}ms avg)`);
  console.log("─".repeat(termWidth));

  // Summary table header
  console.log(`  ${"Endpoint".padEnd(50)} ${"Avg".padEnd(8)} ${"P95".padEnd(8)} ${"RPS".padEnd(8)} ${"Err%"}`);
  console.log(`  ${"─".repeat(50)} ${"─".repeat(8)} ${"─".repeat(8)} ${"─".repeat(8)} ${"─".repeat(6)}`);

  for (const ep of sorted.slice(0, 20)) {
    const label = ep.label.length > 48 ? ep.label.slice(0, 45) + "..." : ep.label;
    const parts = [
      label.padEnd(48),
      fmtMs(ep.avg).padStart(8),
      fmtMs(ep.p95).padStart(8),
      ep.rps.toFixed(0).padStart(8),
      ep.errorRate.toFixed(1).padStart(6),
    ];
    console.log(`  ${parts.join(" ")}`);
  }

  if (sorted.length > 20) {
    console.log(`  ${"─".repeat(50)} [${sorted.length - 20} more endpoints — see full report]`);
  }
  console.log("─".repeat(termWidth));

  // ── Slow Endpoints ──
  if (slowEndpoints.length > 0) {
    console.log(`\n  ⚠  SLOW / PROBLEMATIC ENDPOINTS (${slowEndpoints.length})`);
    console.log("  " + "─".repeat(termWidth - 2));
    for (const ep of slowEndpoints) {
      console.log(`  🔴 ${ep.label}`);
      console.log(`     Avg: ${fmtMs(ep.avg)}  P95: ${fmtMs(ep.p95)}  Errors: ${ep.errorRate.toFixed(1)}%  RPS: ${ep.rps.toFixed(0)}`);
      for (const issue of ep.issues) {
        console.log(`     → ${issue}`);
      }
      console.log();
    }
  }

  // Recommendations summary
  console.log("  RECOMMENDATIONS");
  console.log("  " + "─".repeat(termWidth - 2));
  console.log(`  • Avg > ${SLOW_AVG_THRESHOLD}ms:   Add database indexes, examine query plans`);
  console.log(`  • P95 > ${SLOW_P95_THRESHOLD}ms:   Add Redis/response caching, check N+1 queries`);
  console.log(`  • Error > ${HIGH_ERROR_THRESHOLD}%: Investigate 4xx/5xx responses`);
  console.log(`  • Slow GET:        Add CDN caching, paginate large collections`);
  console.log(`  • Slow writes:     Optimize with bulk operations, connection pooling`);
  console.log("─".repeat(termWidth) + "\n");

  // ── JSON Export ──
  const jsonPath = join(RESULTS_DIR, "benchmark-report.json");
  writeFileSync(jsonPath, JSON.stringify(withIssues, null, 2));
  console.log(`  JSON report:     ${jsonPath}`);

  // ── CSV Export ──
  const csvPath = join(RESULTS_DIR, "benchmark-report.csv");
  const csvHeader = "Endpoint,Method,Avg,Median,P90,P95,P99,Min,Max,RPS,SuccessRate%,ErrorRate%,TimeoutRate%,TotalRequests,FailedRequests\n";
  const csvRows = withIssues
    .map(
      (ep) =>
        `"${ep.label}","${ep.method}",${ep.avg.toFixed(2)},${ep.median.toFixed(2)},${ep.p90.toFixed(2)},${ep.p95.toFixed(2)},${ep.p99.toFixed(2)},${ep.min.toFixed(2)},${ep.max.toFixed(2)},${ep.rps.toFixed(2)},${ep.successRate.toFixed(2)},${ep.errorRate.toFixed(2)},${ep.timeoutRate.toFixed(2)},${ep.totalRequests},${ep.failedRequests}`
    )
    .join("\n");
  writeFileSync(csvPath, csvHeader + csvRows);
  console.log(`  CSV report:      ${csvPath}`);

  // ── HTML Export ──
  const htmlPath = join(RESULTS_DIR, "benchmark-report.html");
  const html = generateHtml(withIssues, slowEndpoints);
  writeFileSync(htmlPath, html);
  console.log(`  HTML report:     ${htmlPath}`);

  // Exit with error if any endpoint exceeds thresholds
  const hasCritical = slowEndpoints.some(
    (ep) => ep.errorRate > HIGH_ERROR_THRESHOLD || ep.avg > SLOW_AVG_THRESHOLD * 3
  );
  if (hasCritical) {
    console.error("\n  ❌ Critical performance issues detected.");
    process.exit(1);
  }
}

function fmtMs(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function generateHtml(
  endpoints: ParsedEndpoint[],
  slow: ParsedEndpoint[]
): string {
  const rows = endpoints
    .map(
      (ep) => `
    <tr class="${ep.avg > SLOW_AVG_THRESHOLD || ep.p95 > SLOW_P95_THRESHOLD ? "slow" : ""}">
      <td>${ep.label}</td>
      <td>${fmtMs(ep.avg)}</td>
      <td>${fmtMs(ep.median)}</td>
      <td>${fmtMs(ep.p90)}</td>
      <td>${fmtMs(ep.p95)}</td>
      <td>${fmtMs(ep.p99)}</td>
      <td>${fmtMs(ep.min)}</td>
      <td>${fmtMs(ep.max)}</td>
      <td>${ep.rps.toFixed(0)}</td>
      <td class="${ep.errorRate > HIGH_ERROR_THRESHOLD ? "error" : "ok"}">${ep.errorRate.toFixed(1)}%</td>
      <td>${ep.totalRequests}</td>
    </tr>`
    )
    .join("\n");

  const bottlenecks = slow
    .map(
      (ep) => `
    <div class="bottleneck">
      <h3>🔴 ${ep.label}</h3>
      <div class="metrics">
        <span class="metric">Avg: ${fmtMs(ep.avg)}</span>
        <span class="metric">P95: ${fmtMs(ep.p95)}</span>
        <span class="metric">Errors: ${ep.errorRate.toFixed(1)}%</span>
        <span class="metric">RPS: ${ep.rps.toFixed(0)}</span>
      </div>
      <ul class="issues">
        ${ep.issues.map((i) => `<li>${i}</li>`).join("\n")}
      </ul>
    </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>API Benchmark Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #c9d1d9; padding: 2rem; }
  h1 { color: #58a6ff; margin-bottom: 0.5rem; }
  h2 { color: #8b949e; margin: 2rem 0 1rem; border-bottom: 1px solid #21262d; padding-bottom: 0.5rem; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 1.25rem; }
  .card .value { font-size: 1.8rem; font-weight: 700; color: #58a6ff; }
  .card .label { font-size: 0.85rem; color: #8b949e; margin-top: 0.25rem; }
  table { width: 100%; border-collapse: collapse; background: #161b22; border: 1px solid #30363d; border-radius: 8px; overflow: hidden; }
  th { background: #21262d; padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #8b949e; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
  td { padding: 0.6rem 1rem; border-top: 1px solid #21262d; font-size: 0.9rem; }
  tr:hover { background: #1c2128; }
  tr.slow { background: rgba(248,81,73,0.08); }
  .ok { color: #3fb950; }
  .error { color: #f85149; font-weight: 600; }
  .bottleneck { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; }
  .bottleneck h3 { color: #f85149; margin-bottom: 0.5rem; }
  .metrics { display: flex; gap: 1.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
  .metric { font-size: 0.9rem; color: #c9d1d9; }
  .issues { list-style: none; padding: 0; }
  .issues li::before { content: "→ "; color: #58a6ff; }
  .issues li { padding: 0.25rem 0; color: #8b949e; font-size: 0.9rem; }
  footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #21262d; color: #484f58; font-size: 0.85rem; }
  @media (max-width: 768px) { body { padding: 1rem; } .summary { grid-template-columns: 1fr 1fr; } }
</style>
</head>
<body>
  <h1>📊 API Benchmark Report</h1>
  <p style="color: #8b949e; margin-bottom: 2rem;">Generated on ${new Date().toISOString().replace("T", " ").slice(0, 19)}</p>

  <div class="summary">
    <div class="card"><div class="value">${endpoints.length}</div><div class="label">Endpoints Tested</div></div>
    <div class="card"><div class="value">${slow.length}</div><div class="label">⚠ Bottlenecks</div></div>
    <div class="card"><div class="value">${endpoints.reduce((s, e) => s + e.totalRequests, 0)}</div><div class="label">Total Requests</div></div>
    <div class="card"><div class="value">${endpoints.reduce((s, e) => s + e.failedRequests, 0)}</div><div class="label">Failed Requests</div></div>
  </div>

  ${bottlenecks.length > 0 ? `<h2>⚠ Bottlenecks & Recommendations</h2>
  <div class="recommendations">
    <div class="card" style="margin-bottom: 1rem;">
      <h3 style="color: #58a6ff; margin-bottom: 0.5rem;">Quick Wins</h3>
      <ul class="issues">
        <li>Add database indexes on frequently queried columns (user_id, foreign keys, date ranges)</li>
        <li>Implement Redis caching for GET endpoints returning reference data</li>
        <li>Add pagination to list endpoints returning >100 records</li>
        <li>Use connection pooling (already configured in postgres client at max=10)</li>
        <li>Add Content-Caching headers for static/reference data</li>
      </ul>
    </div>
  </div>
  ${bottlenecks}</div>` : ""}

  <h2>All Endpoints (ranked by avg latency)</h2>
  <div style="overflow-x: auto;">
  <table>
    <thead>
      <tr>
        <th>Endpoint</th>
        <th>Avg</th>
        <th>P50</th>
        <th>P90</th>
        <th>P95</th>
        <th>P99</th>
        <th>Min</th>
        <th>Max</th>
        <th>RPS</th>
        <th>Err%</th>
        <th>#Req</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  </div>

  <footer>
    <p>Thresholds: Avg > ${SLOW_AVG_THRESHOLD}ms ⚠ | P95 > ${SLOW_P95_THRESHOLD}ms ⚠ | Error > ${HIGH_ERROR_THRESHOLD}% 🔴</p>
    <p>Run with: k6 run --summary-export=benchmarks/results/k6-summary.json benchmarks/k6/benchmark.js</p>
  </footer>
</body>
</html>`;
}

// ── CLI Entry ──
const inputFile = process.argv[2] || join(RESULTS_DIR, "k6-summary.json");
generateReport(inputFile);
