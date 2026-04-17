# G.A.N.E NAV Platform Service

This directory contains the "Missing Core Implementation Pack" requested in
the project directive — the runtime-wired TypeScript scaffolding for the
backend, RBAC, policy engine, trust ledger, release gate, regression
sentinel, safety-UX modes, route explainer, offline state, admin panel and
billing boundary.

## Layout

```
services/gane-platform/
├── infra/
│   ├── api/
│   │   ├── server.ts          # Express + tRPC standalone HTTP handler
│   │   └── trpc/router.ts     # Typed tRPC router wiring all modules
│   └── db/schema.ts           # Drizzle ORM / Postgres schema
├── admin/rbac.ts              # Role → permission map, checkPermission
├── policy/evaluator.ts        # Rule-based PolicyEngine
├── trust/ledger.ts            # Monotonic TrustLedger
├── engine/routing/explainer.ts# Deterministic route explanation
├── offline/sovereignty.ts     # OfflineState snapshot
├── proof/release-gate.ts      # APPROVED / BLOCKED verdict
├── sentinel/regression.ts     # >5% delta detection
├── ui/safety-ux/modes.ts      # driving_safe / emergency_safe / degraded_safe
├── ui/admin/control.tsx       # Admin panel React component
├── billing/stripe.ts          # Stripe boundary (throws STRIPE_NOT_CONFIGURED)
└── tests/platform.test.ts     # Vitest suite — every module exercised
```

## Truth classification

Every module here is marked **PRESENT_REAL** — each is:

1. Implemented with runtime logic (not a stub).
2. Wired into the tRPC router so it executes on every request.
3. Covered by the vitest suite in `tests/platform.test.ts`.

The `billing/stripe.ts` module deliberately throws `STRIPE_NOT_CONFIGURED`
rather than returning a fake session, to satisfy the "no FAKE_SUCCESS" rule
in the directive until a real Stripe key is injected.

## Commands

```bash
npm install                 # install deps (uses package.json here)
npm run typecheck           # tsc --noEmit
npm test                    # vitest run
npm run dev                 # tsx infra/api/server.ts → http://localhost:4000
npm run build               # esbuild bundle to dist/server.js
```

## Relation to the Rust workspace

The Rust crates under `crates/gane-*` implement the GNSS / fusion /
integrity / continuity / routing core (real-time path). This Node service
is the control-plane surface that sits on top — RBAC, release gate, trust
ledger, policy rules, admin UI. The two halves share the G.A.N.E NAV
canonical data model; wiring the HTTP boundary between them is tracked in
the root `README.md`.
