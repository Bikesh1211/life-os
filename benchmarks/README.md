# API Benchmark Suite

Automated API performance testing for Focus Linq (Next.js 16).

## Prerequisites

```bash
# Install k6
# macOS:
brew install k6
# Linux (Debian/Ubuntu):
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
# Or download from: https://k6.io/docs/getting-started/installation/
```

```bash
# Install project dependencies (already done)
pnpm install
```

## Setup

1. **Configure environment:**
```bash
export BENCHMARK_BASE_URL="http://localhost:3000"
export BENCHMARK_EMAIL="your-benchmark-user@example.com"
export BENCHMARK_PASSWORD="your-password"
export SEED_USER_ID="your-test-user-uuid"
```

2. **Discover routes** (auto-detect all API endpoints):
```bash
npm run discover-routes
```

3. **Seed data** (populate DB with test records):
```bash
BENCHMARK_RECORDS=250 npm run benchmark-seed
```

## Running

### Quick benchmark (default: 10 VUs)
```bash
npm run benchmark
```

### Stress test (ramp up to 500 VUs)
```bash
npm run stress
```

### Sustained load test (soak test)
```bash
npm run load
```

### With custom parameters
```bash
VUS=100 REQUESTS_PER_ROUTE=50 npm run benchmark
VUS=1000 BENCHMARK_BASE_URL="https://staging.example.com" npm run stress
```

## Reports

```bash
# Generate HTML/JSON/CSV reports from k6 output
npm run report
```

Outputs in `benchmarks/results/`:
- `benchmark-report.html` — Interactive dark-mode HTML report
- `benchmark-report.json` — Machine-readable data
- `benchmark-report.csv` — Spreadsheet-friendly data

## Interpreting Results

### Threshold alerts
| Threshold | Meaning | Action |
|-----------|---------|--------|
| Avg > 200ms | Endpoint is slow on average | Index queries, check N+1 |
| P95 > 500ms | 5% of users experience slow responses | Add caching, optimize queries |
| Error > 1% | >1% requests fail | Debug 4xx/5xx responses |

### Performance tiers
| Avg Latency | Grade | What to do |
|-------------|-------|------------|
| < 50ms | 🟢 Excellent | No action needed |
| 50–200ms | 🟡 Good | Monitor if growing |
| 200–500ms | 🟠 Needs attention | Profile and optimize |
| 500–1000ms | 🔴 Slow | Urgent investigation |
| > 1000ms | ❌ Critical | Blocking user experience |

## Files

```
benchmarks/
├── benchmark.config.ts       # User-editable config
├── scripts/
│   ├── discover-routes.ts    # Static route analysis
│   ├── seed.ts               # Drizzle seed script
│   └── generate-report.ts    # Report generator
├── k6/
│   ├── lib/auth.js           # Supabase login
│   ├── benchmark.js          # Main benchmark
│   ├── stress.js             # Stress test
│   └── load.js               # Load test
├── routes.json               # Generated route list
├── route-params.json         # Seed ID mapping
├── results/                  # Reports output
└── reports/template.html     # HTML template
```
