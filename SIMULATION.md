# System Simulation Specification

## Overview
- Scope: End-to-end simulation of Placas Nova Odessa (SGMU) operations across map exploration, cart, order creation, installation tasks, and reporting.
- Goal: Accurately reproduce component interactions, latency behaviors, load/concurrency, and accessibility guarantees to validate reliability and user experience against defined SLOs.
- Modes: Deterministic (repeatable runs) and stochastic (realistic variability).

## Components
- Frontend (Vite React): map/catalog, cart, orders, installation views, reports.
- Frontend (Next.js module `sgmu-next`): server-rendered pages and auth flows.
- UI library: Radix UI dialogs, menus, tooltips; Tailwind styling.
- Backend: Supabase (Auth, DB, Functions) and Google Maps API.
- Testing: Vitest + RTL for unit/a11y; optional Playwright for E2E.

## Entities
- User: id, role (`admin`, `operator`, `customer`).
- Point: id, coordinates, address, tags[], `pricing_tier_id`, status.
- Tag: id, name.
- PricingTier: id, name, base price, adjustment rules.
- Cart: items[], subtotal, taxes, total.
- Order: id, customer_id, items[], total, status.
- OrderItem: id, order_id, point_id/service_id, price.
- InstallationTask: id, order_id, step, status, timestamps.

## Interactions & Behaviors
- Map exploration: load points; cluster; filter; open details.
- Cart actions: add/remove items; recalc totals; persist per session.
- Order creation: validate inputs; write to DB; display confirmation.
- Installation pipeline: generate tasks; update statuses; notify completion.
- Reporting: generate printable order and points report.
- Accessibility: dialogs require `DialogTitle` and `aria-describedby` linked to `DialogDescription` or `description` prop.

## Input Parameters
- Global
  - `seed`: integer for deterministic RNG.
  - `concurrency`: number of simulated concurrent users.
  - `durationSec`: test duration.
  - `networkLatencyMs`: distribution config { mean, p95, jitter }.
- Map
  - `pointsCount`: total points; clustering thresholds.
  - `filterComplexity`: number of simultaneous filter rules.
  - `tileLoadBehavior`: CDN latency distribution.
- Cart
  - `avgItemsPerOrder`: mean and variance.
  - `priceDistribution`: mix of tiers.
- Orders
  - `orderWriteLatencyMs`: DB write latency distribution.
  - `rlsEnabled`: boolean; validates row-level security.
- Installation
  - `tasksPerOrder`: average steps per order; step durations.
  - `completionRate`: probability of task success.
- Accessibility
  - `includeTitle`: whether `DialogTitle` is present.
  - `descMode`: `child-description` | `prop-description` | `none`.

Example JSON
```
{
  "seed": 42,
  "concurrency": 50,
  "durationSec": 600,
  "networkLatencyMs": { "mean": 120, "p95": 450, "jitter": 0.2 },
  "map": {
    "pointsCount": 10000,
    "filterComplexity": 3,
    "tileLoadBehavior": { "mean": 300, "p95": 900 }
  },
  "cart": { "avgItemsPerOrder": 3.2, "priceDistribution": "tiers_mixed" },
  "orders": { "orderWriteLatencyMs": { "mean": 80, "p95": 250 }, "rlsEnabled": true },
  "installation": { "tasksPerOrder": 5, "completionRate": 0.97 },
  "a11y": { "includeTitle": true, "descMode": "child-description" }
}
```

## Expected Outputs
- Latency metrics per action (map load, filter, add-to-cart, checkout, task update).
- Throughput (orders/min, tasks/min).
- Error rates (API failures, validation errors).
- A11y outcomes (presence of `aria-describedby`, absence of blocking warnings).
- Resource usage (CPU/memory of client during peak interactions; bundle timing if measured).

## Performance Metrics
- Map
  - Time-to-first-marker, clustering compute latency, tile load p95.
- Cart
  - Add/remove item latency; total recompute p95.
- Orders
  - Checkout p95; DB write p95; success rate.
- Installation
  - Task update latency; pipeline completion times.
- Global
  - TTI (Time To Interactive); p50/p95 per action; error rate < 1%.

## Validation Criteria
- SLOs
  - Map: tile load p95 < 1500ms; filters apply p95 < 500ms.
  - Cart: add/remove p95 < 200ms; total recompute p95 < 150ms.
  - Orders: checkout p95 < 1000ms; success > 99%.
  - Installation: task update p95 < 400ms; completion within SLA.
  - A11y: dialogs have `DialogTitle` + `aria-describedby`; tests pass.
- Consistency
  - Deterministic runs produce metric deltas < 5% across seeds.
- Correctness
  - RLS prevents cross-tenant reads/writes in simulated access patterns.

## Setup
- Prerequisites
  - Node.js 18+, `pnpm`.
  - Supabase project and keys for Next (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
  - Windows note: avoid spaces in project path or use WSL to prevent Vite/Vitest path normalization issues.
- Repo
  - Install: `pnpm install`.
  - Dev (Vite): `pnpm dev` (adjust port if needed).
  - Tests: `pnpm test` (Vitest configured with jsdom; alias `@` enabled).

## Execution
- Unit/A11y
  - Run `pnpm test` to verify dialog accessibility: ensures `aria-describedby` links to `DialogDescription` or `description` prop.
- Scenario Simulation (conceptual)
  - Use a harness (Playwright or custom script) to:
    - Spawn `concurrency` users.
    - Each user: open map, apply `filterComplexity` filters, open point, add `avgItemsPerOrder` items to cart, checkout, generate `tasksPerOrder` and mark them complete with `completionRate`.
    - Record timings for each action and success/failure.
- Optional Tools
  - Playwright for E2E; K6 or custom Node scripts for concurrency; MSW for API mocking when backend not available.

## Interpretation of Results
- Compute p50/p95/p99 per action; compare against SLOs.
- Identify bottlenecks (e.g., clustering latency, DB writes, tile load).
- Check a11y warnings; absence indicates compliance.
- Assess variability (coefficient of variation) to identify instability.

## Data Sets
- Points
  - Synthetic generation across city grids; tag distribution skewed to mimic real usage.
- Pricing
  - Tiers Bronze/Prata/Ouro; price dispersion per tier.
- Orders
  - Mixture of single-point and multi-point orders; include edge cases.

## Scenarios
- Baseline: Light load, small filters.
- Peak: High concurrency, dense map, complex filters.
- Adverse Network: Increased latency and jitter.
- Heavy Cart: Large number of items per order.
- A11y Strict: Title hidden visually but present; `aria-describedby` via child description.

## Failure Modes
- Network errors (tile/API timeouts), DB write conflicts, auth failures.
- Frontend limits (memory spikes with 10k points).
- Mitigation: retries, progressive loading, cluster thresholds adjustments.

## Reporting
- Output
  - JSON metrics file: latencies, counts, error rates.
  - HTML summary (optional): charts per action.
- Storage
  - Save runs with timestamps; compare trends across releases.

## Next Steps
- Implement Playwright harness for the scenarios above.
- Add MSW-based mocks to simulate Supabase responses where needed.
- Instrument frontend with performance marks for more granular timing.
- Integrate CI job to run a subset of simulations per PR.