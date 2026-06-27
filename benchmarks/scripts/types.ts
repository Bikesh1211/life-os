export interface RouteInfo {
  path: string;
  method: string;
  hasParams: boolean;
  paramNames: string[];
  paramPositions: number[];
  safeName: string;
  label: string;
  requestBody?: Record<string, unknown>;
}

export interface DiscoveredRoutes {
  routes: RouteInfo[];
  totalRoutes: number;
  totalMethods: number;
  plugins: string[];
}

export interface BenchmarkResult {
  route: string;
  method: string;
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
  slowestEndpoint: boolean;
  fastestEndpoint: boolean;
  issues: string[];
}

export interface SeedRecord {
  table: string;
  id: string;
  routePattern: string;
}

export interface RouteParamMap {
  [routePattern: string]: {
    [paramName: string]: string;
  };
}
