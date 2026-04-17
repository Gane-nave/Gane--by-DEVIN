# G.A.N.E NAV — Web Frontend

This directory contains the React/TypeScript dashboard client for **G.A.N.E NAV**
(Global Autonomous Navigation Engine / Global Mobility Intelligence Network).

It is intended to sit on top of the Rust workspace in `../crates/aurora-api/`
(REST API, Axum-based) and complement the lightweight Leaflet dashboard that
lives in `../crates/aurora-web/`.

## Status

This is a **snapshot** imported from the original `gmin-spec-complete.zip`
bundle. It preserves 27 source files under `src/`:

- `src/App.tsx` — routing, providers, error boundaries
- `src/_core/hooks/useAuth.ts`
- `src/components/*.tsx` — 22 dashboard / panel components
- `src/components/ErrorBoundary.tsx` and `ComponentErrorBoundary.tsx`

The snapshot is **not buildable in isolation**. The source references a number
of modules that were not part of the imported bundle (based on a static grep of
the imports in `src/App.tsx` and `src/components/*.tsx`):

- `@/components/ui/*` — shadcn/ui primitives (`button`, `avatar`, `tooltip`,
  `sonner`, `scroll-area`, `textarea`) — not copied in.
- `@/contexts/*` — `ThemeContext`, `NavigationContext`, `RealDataContext`,
  `LanguageContext`, `VoiceContext`, `GANEContext`, `AdminModeContext`.
- `@/pages/*` — `Home`, `NotFound`, `AdminPanel`, `JoinByInvite`,
  `NotificationCenter`.
- `@/hooks/*` — `useCollaboration`, `useMobile`, `useNotifications`.
- `@/lib/*` — `trpc`, `sentry`, `utils`.
- `@/engine/batteryOptimizer`, `@/const`.

The accompanying verification reports in `docs/` (see `ACCEPTANCE_REPORT.md`,
`FINAL_PRELAUNCH_REPORT.md`, etc.) describe a larger project of roughly
298 files / 94 k lines / 400 tests. Only the 27 files above are present in
this repository at the moment — the rest of the tree, plus a tRPC server,
Drizzle schema, and test suite, needs to be supplied separately before the
frontend can be wired back up and built.

## Next Steps

To bring this frontend back to a green build, the missing modules listed above
need to be re-imported (or rewritten against `aurora-api`). The Rust backend
already exposes an HTTP surface via `aurora-api`, so the shadcn/tRPC stack can
be swapped for thin REST / WebSocket clients as a cleaner alternative.

## Docs

`docs/` contains the historical status reports from the original bundle:

- `SUMMARY_HE.md` — Hebrew project summary.
- `ACCEPTANCE_REPORT.md` — acceptance log.
- `AUDIT_REPORT.md` / `AUDIT_FINDINGS.md` — prior audit runs.
- `FINAL_PRELAUNCH_REPORT.md` — pre-launch checklist.
- `LIGHTHOUSE_AUDIT.md` — web-perf audit notes.

These describe the state of the project at the time of the snapshot and do
**not** reflect the current contents of this directory on their own — treat
them as historical context rather than as a statement of today's truth.
