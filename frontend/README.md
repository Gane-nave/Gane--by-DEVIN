# G.A.N.E NAV — Web Frontend (full snapshot)

This directory is the Node-based web stack of **G.A.N.E NAV**. It is a
full imported frontend snapshot and complements the Rust
workspace in `../crates/`:

| Role | Location | Notes |
|---|---|---|
| Rust REST API | `../crates/` | Axum real-time workspace |
| Rust dashboard (Leaflet) | `../crates/` | Lightweight, server-rendered |
| **Node API / web app** | `./server`, `./client`, `./shared` | This directory |

The Node stack is the richer product surface (Drizzle + Postgres +
OpenTelemetry + Playwright + Vitest + Radix UI). The Rust API layer
is the high-assurance real-time path.

## Layout

```
frontend/
  package.json           # pnpm workspace root, ESM, TS throughout
  pnpm-lock.yaml
  tsconfig.json          # Client + shared tsconfig
  tsconfig.node.json     # Server / tooling tsconfig
  vite.config.ts         # Vite 5 with TS paths
  vitest.config.ts       # Unit / integration tests
  playwright.config.ts   # E2E tests (Chromium / WebKit / Firefox)
  drizzle.config.ts      # Drizzle ORM migrations config
  components.json        # shadcn/ui component registry

  client/                # React 18 + Vite front-end
    index.html
    src/
      main.tsx           # Entry
      App.tsx            # Router + providers
      index.css          # Tailwind base
      const.ts           # Shared client constants
      _core/             # Hooks, providers
      components/        # UI components (dashboards, maps, panels)
      contexts/          # React Contexts
      engine/            # Client-side engines (battery, sensors, …)
      hooks/             # Data-fetching / state hooks
      lib/               # Pure utilities
      pages/             # Route pages

  server/                # Express + OpenTelemetry + Drizzle API
    _core/               # Bootstrap, middleware
    gane/                # G.A.N.E-specific route handlers / engines
    routers.ts           # Top-level router composition
    db.ts                # Drizzle DB handle
    storage.ts           # Object storage abstraction
    index.ts             # HTTP entrypoint
    *.test.ts            # Vitest tests

  shared/                # Shared contracts between client & server
    _core/
    const.ts
    contracts/
    types.ts

  drizzle/               # Drizzle migrations (SQL + metadata)

  e2e/                   # Playwright scenarios
  load-tests/            # k6 / Artillery load tests
  monitoring/            # Dashboards, alert rules
  patches/               # npm patches (patch-package)

  docs/                  # APK_TWA_GUIDE, CANONICAL_BACKLOG, system audit
  ACCEPTANCE_REPORT.md   # Historical status reports
  AUDIT_REPORT.md
  AUDIT_FINDINGS.md
  FINAL_PRELAUNCH_REPORT.md
  LIGHTHOUSE_AUDIT.md
  SUMMARY_HE.md
  USER_REQUIREMENTS_COMPREHENSIVE.md
  qa-*.md                # QA notes snapshot
  ideas.md, todo.md, …   # Planning docs
```

## Quick start

```bash
cd frontend

# Install deps (pnpm lockfile, node 20+).
pnpm install

# Dev — boots the tsx-watched Express server + Vite.
pnpm dev

# Production build (Vite client + esbuild-bundled Node server).
pnpm build
pnpm start

# Type check only.
pnpm check

# Unit tests.
pnpm test

# End-to-end tests (Playwright).
pnpm test:e2e
```

Environment variables live in `.env` (ignored). See `drizzle.config.ts`
for database connection, and the OpenTelemetry OTLP env vars for
tracing.

## Relationship to the rest of the monorepo

- The Rust workspace in `../crates/` is the **source of truth** for
  positioning, sensor fusion, integrity, and the REST reference
  implementation. For production/high-assurance
  deployments, the Node server forwards to the Rust API where needed.
- `../apps/trade/` and `../apps/brainiac/` are separate React apps
  imported from standalone bundles. They currently ship with their own
  `package.json` / `tsconfig` / Vite config and are **not** linked into
  this pnpm workspace. Over time they should either converge on these
  shared configs or be split back out; see `../MONOREPO.md`.

## Status

This snapshot was re-imported on 2026-04-17 from a legacy frontend
archive (456 files, ~6.5 MB). Everything that was
originally inside that archive is preserved verbatim — including the
audit reports, QA logs, patches, migrations, and E2E tests — with two
exceptions:

1. `frontend/test-results/` was stripped (run artefacts, not source).
2. Binary archives (`*.zip`, `*.pdf`) are blocked at the repo-level
   `.gitignore`.

`pnpm install` + `pnpm build` have **not** been executed on CI yet in
this repo. The CI workflow (`.github/workflows/`) currently only
builds the Rust workspace. Adding a Node job is a follow-up.
