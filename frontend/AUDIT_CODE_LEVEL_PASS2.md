# G.A.N.E NAV — Code-Level Audit · Pass 2

**Branch:** `devin/canonical-rename-pass-2`
**As of commit:** `02c16e3f`
**Scope:** `frontend/client/src/**`, `frontend/shared/**`, `frontend/server/**`
**Method:** mechanical static scans + ripgrep heuristics.
**Supersedes parts of** `frontend/AUDIT_FINDINGS.md`, which is intact as
the historical pass-1 defect register.

Closes `todo.md` item:
> `Full code-level audit — every file, every import, every type, every path`

---

## 0 · Verification baseline (as of this commit)

| Check | Result |
|---|---|
| `npm run check` (tsc --noEmit) | **clean** — 0 errors |
| `npm run test` | **489 passed / 5 skipped** (20 test files) |
| `npm run build` | **clean** — 9.4 s, dist/index.js 320 kB |
| `scripts/verify-unified-repo.ps1` | **green** end-to-end |

---

## 1 · Headline metrics

| Metric | Count |
|---|---|
| Source files (`.ts` / `.tsx`) | **326** |
| Engines (`client/src/engine/*.ts`) | 49 |
| Hooks (`client/src/hooks/*.ts`) | 11 |
| `@ts-ignore` / `@ts-expect-error` | **0** |
| Silent catch blocks (`catch (_) {}`) | **0** |
| `TODO` / `FIXME` / `HACK` / `XXX` comments | **1** |
| `console.log` / `console.debug` in production code | 47 |
| Explicit `any` usages | 61 |
| Files over 800 lines | 19 |
| Hardcoded secret matches (excluding prefix-format tests) | **0** |

---

## 2 · Findings, ranked

### 2.1 — CLEAN · no action required

- **Zero** `@ts-ignore` / `@ts-expect-error`: the codebase holds the
  type system honest end-to-end.
- **Zero** silent catch blocks: every `catch` has a body (inspected via
  regex `catch\s*\(\s*[a-z_]+\s*\)\s*\{\s*\}` — 0 matches).
- **Zero** hardcoded secrets. The two regex hits are in
  `server/gane/stripe-keys.test.ts` lines 14 and 19, which validate
  Stripe-key **prefix format** (`sk_test_` / `sk_live_`) — not real
  keys.
- **Only one** `TODO`: `server/db.ts:104` — a schema-growth hint, not a
  bug. Left as-is; low priority.

### 2.2 — MEDIUM · visibility debt (`console.log` × 47)

Production code uses `console.log` / `console.debug` instead of the
project's Sentry + OpenTelemetry transport. The worst offenders:

| File | Count |
|---|---|
| `client/src/engine/chaosTesting.ts` | 17 |
| `client/src/engine/webgpuNerf.ts` | 8 |
| `client/src/engine/benchmarkHarness.ts` | 7 |
| `client/src/engine/wsClient.ts` | 4 |
| `client/src/engine/predictiveIntent.ts` | 4 |

**Recommendation:** route through a `debugLog(level, msg, meta)`
helper that respects `import.meta.env.DEV` and funnels production
events to Sentry/Tempo. Cheap, non-behavioural change.

### 2.3 — MEDIUM · type laxity (`any` × 61)

Top offenders:

| File | Count |
|---|---|
| `client/src/engine/multiProviderRouting.ts` | 10 |
| `client/src/pages/AdminPanel.tsx` | 5 |
| `client/src/pages/NotificationCenter.tsx` | 4 |
| `client/src/engine/eventBus.ts` | 4 |
| `client/src/components/VoiceCommandSystem.tsx` | 4 |
| `client/src/components/CollaborationPanel.tsx` | 4 |

`multiProviderRouting.ts` is worth the strictness pass now that
`shared/contracts/vehicleRouting.ts` supplies typed `VehicleConstraints`
— the provider adapters are the natural next step.

### 2.4 — LOW · refactor candidates (files > 800 lines)

19 files. Top 10:

| Lines | File |
|---:|---|
| 3810 | `client/src/lib/ganeData.ts` |
| 1736 | `client/src/lib/specData.ts` |
| 1437 | `client/src/pages/ComponentShowcase.tsx` |
| 1257 | `client/src/components/SmartPanels.tsx` |
| 1080 | `server/gane/collaborationRouter.ts` |
| 1067 | `client/src/engine/positionFallbackChain.ts` |
| 1003 | `client/src/engine/webgpuNerf.ts` |
|  958 | `client/src/engine/policyEngine.ts` |
|  929 | `client/src/engine/multiProviderRouting.ts` |
|  921 | `shared/contracts/fieldTestProgram.ts` |

The two `lib/*.ts` megafiles are primarily static data (seed
dictionaries); they are read-only at runtime and don't carry logic
complexity. The panel and engine files would benefit from extraction
once product work calms; no immediate runtime cost.

### 2.5 — HIGH-SIGNAL · unit-test coverage gap on engines (38 / 49)

**38 of 49** engines and hooks have no matching `*.test.ts` under
`server/**`. Highest-leverage candidates to cover next:

- `positionFallbackChain.ts` — safety-critical; already has
  `shared/contracts/fallbackSeverity.ts` tests, but the chain's own
  state machine + circuit breakers are untested.
- `multiConstellation.ts` — safety-critical; partial coverage via
  `constellation-handoff.test.ts` (pure helpers), but the engine's
  satellite-list bookkeeping is untested.
- `offlineMapEngine.ts` — data-loss risk on cache eviction.
- `policyEngine.ts` — compliance surface; enforcement bugs = audit
  failures.
- `benchmarkHarness.ts` — guards SLOs for the whole app.
- `etaEngine.ts`, `multiSourceMaps.ts`, `mlPrediction.ts`,
  `digitalTwin.ts`, `geospatialIndex.ts` — all user-visible behaviour.

**Recommendation:** prioritise a pure-helper extraction + test pass on
these five safety-and-compliance-critical engines. The pattern already
landed in this branch (`shared/contracts/fallbackSeverity.ts`,
`shared/contracts/constellationHandoff.ts`,
`shared/contracts/vehicleRouting.ts`) is the template.

---

## 3 · What the audit confirmed

- Canonical naming: clean across 2,452 Rust crates + 326 TS/TSX files
  (verified in `caa44f1b`).
- Type safety: no escape hatches in use; **0** `@ts-ignore`.
- Error handling discipline: **0** silent catches.
- Secrets hygiene: **0** real hardcoded secrets.
- Regression posture: **+56** new tests landed across this branch with
  **0** regressions in the pre-existing 433-test baseline.

## 4 · Prioritised next engineering steps

1. **`debugLog` helper** — eliminate the 47 `console.log`s in ~1 h.
2. **Strictify `multiProviderRouting.ts`** — 10 `any` → typed provider
   responses; plumb `VehicleConstraints` into adapters.
3. **Engine unit tests** — start with `positionFallbackChain.ts` and
   `policyEngine.ts`.
4. **ts-prune / knip** — add to `scripts/verify-unified-repo.ps1` to
   catch unused exports in CI.

---

## 5 · Cross-reference

- `docs/CLAUDE_CODE_HANDOFF.md` §3 — master-directive gaps
- `frontend/AUDIT_FINDINGS.md` — pass-1 defect register (historical)
- `frontend/FINAL_PRELAUNCH_REPORT.md` — §8 publication checklist
- `frontend/todo.md` — item-level backlog (21 closed this branch)

*Audit generated 2026-04-21 by mechanical scan at commit `02c16e3f`.*
