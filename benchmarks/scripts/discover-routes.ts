import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative, parse } from "path";

interface RouteInfo {
  path: string;
  method: string;
  hasParams: boolean;
  paramNames: string[];
  safeName: string;
  label: string;
}

interface DiscoveredRoutes {
  routes: RouteInfo[];
  totalFiles: number;
  totalMethods: number;
  plugins: string[];
}

const API_DIR = join(process.cwd(), "src/app/api");

const METHOD_RE = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;

function extractMethods(filePath: string): string[] {
  const content = readFileSync(filePath, "utf-8");
  const methods: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = METHOD_RE.exec(content)) !== null) {
    methods.push(match[1]);
  }
  return methods;
}

function pathToRoutePattern(absolutePath: string): string {
  const rel = relative(API_DIR, absolutePath);
  const dir = parse(rel).dir;
  const segments = dir.split("/").filter(Boolean);

  const apiSegments = segments.map((s) => {
    if (s.startsWith("[") && s.endsWith("]")) {
      return `:${s.slice(1, -1)}`;
    }
    return s;
  });

  return `/api/${apiSegments.join("/")}`;
}

function extractParamNames(absolutePath: string): string[] {
  const rel = relative(API_DIR, absolutePath);
  const dir = parse(rel).dir;
  const segments = dir.split("/").filter(Boolean);
  return segments
    .filter((s) => s.startsWith("[") && s.endsWith("]"))
    .map((s) => s.slice(1, -1));
}

function inferPlugin(filePath: string): string {
  const rel = relative(API_DIR, filePath);
  return rel.split("/")[0] ?? "unknown";
}

function findRouteFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findRouteFiles(fullPath));
    } else if (entry.isFile() && entry.name === "route.ts") {
      results.push(fullPath);
    }
  }
  return results;
}

function discoverRoutes(): DiscoveredRoutes {
  const files = findRouteFiles(API_DIR);

  const routes: RouteInfo[] = [];
  let totalMethods = 0;

  for (const file of files) {
    const methods = extractMethods(file);
    const routePath = pathToRoutePattern(file);
    const paramNames = extractParamNames(file);
    const hasParams = paramNames.length > 0;

    for (const method of methods) {
      const safeName = `${method}_${routePath.replace(/[:\/]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "")}`;
      routes.push({
        path: routePath,
        method,
        hasParams,
        paramNames,
        safeName,
        label: `${method} ${routePath}`,
      });
      totalMethods++;
    }
  }

  const plugins = [...new Set(files.map(inferPlugin))].sort();

  return { routes, totalFiles: files.length, totalMethods, plugins };
}

function main() {
  const discovered = discoverRoutes();

  const apiRoutes = [...new Set(discovered.routes.map((r) => r.path))];
  const paramRoutes = discovered.routes.filter((r) => r.hasParams);
  const uniqueParamRoutes = [...new Set(paramRoutes.map((r) => r.path))];

  console.log(`\n  API Route Discovery Complete`);
  console.log(`  ${"─".repeat(40)}`);
  console.log(`  Route files found:  ${discovered.totalFiles}`);
  console.log(`  Total endpoints:    ${discovered.totalMethods}`);
  console.log(`  Unique API routes:  ${apiRoutes.length}`);
  console.log(`  Parametrized:       ${uniqueParamRoutes.length}`);
  console.log(`  Plugins:            ${discovered.plugins.length}`);
  console.log(`  ${"─".repeat(40)}\n`);

  const outPath = join(process.cwd(), "benchmarks/routes.json");
  writeFileSync(outPath, JSON.stringify(discovered, null, 2));

  console.log(`  Routes written to: ${outPath}`);
}

main();
