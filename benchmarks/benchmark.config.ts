export interface BenchmarkConfig {
  baseUrl: string;
  concurrencyLevels: number[];
  requestsPerEndpoint: number;
  timeout: string;
  supabase: {
    url: string;
    anonKey: string;
    email: string;
    password: string;
  };
  seed: {
    enabled: boolean;
    userId: string;
    recordsPerTable: number;
  };
  thresholds: {
    avgResponseMs: number;
    p95Ms: number;
    errorRate: number;
  };
  reportFormats: ("html" | "json" | "csv")[];
}

const config: BenchmarkConfig = {
  baseUrl: process.env.BENCHMARK_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  concurrencyLevels: [1, 10, 50, 100, 500, 1000],

  requestsPerEndpoint: 100,

  timeout: "30s",

  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    email: process.env.BENCHMARK_EMAIL ?? "benchmark@example.com",
    password: process.env.BENCHMARK_PASSWORD ?? "",
  },

  seed: {
    enabled: true,
    userId: process.env.SEED_USER_ID ?? process.env.BENCHMARK_USER_ID ?? "",
    recordsPerTable: 250,
  },

  thresholds: {
    avgResponseMs: 200,
    p95Ms: 500,
    errorRate: 1,
  },

  reportFormats: ["html", "json", "csv"],
};

export default config;
