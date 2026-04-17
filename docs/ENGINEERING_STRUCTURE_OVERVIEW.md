# G.A.N.E NAV Engineering Structure Overview

This repository is a single integrated monorepo, but it is organized as a
polyglot system rather than a literal single-language `src/` tree. The
conceptual structure below is the canonical engineering model for the
repository.

## Conceptual Layout

```text
G.A.N.E-NAV/
├── docs/
├── scripts/
├── crates/                  # Deterministic navigation/runtime core
├── frontend/                # Full web stack and product UI
├── services/gane-platform/  # Control plane backend and policy/trust modules
├── apps/trade/              # Additional product surface
└── .github/
```

## Canonical Layer Mapping

### `src/core`

Conceptual responsibility:
- deterministic navigation engine
- GNSS, correction handling, sensor fusion
- continuity, integrity, routing, confidence

Repository mapping:
- `crates/gane-core`
- `crates/gane-gnss`
- `crates/gane-corrections`
- `crates/gane-sensors`
- `crates/gane-fusion`
- `crates/gane-integrity`
- `crates/gane-continuity`
- `crates/gane-routing`
- `crates/gane-map`
- `crates/gane-risk`

### `src/data_matrix`

Conceptual responsibility:
- source-of-truth data surfaces
- event bus
- storage and telemetry processing
- backend orchestration

Repository mapping:
- `frontend/server/`
- `services/gane-platform/infra/`
- `crates/gane-storage`
- `crates/gane-telemetry`
- `crates/gane-events`
- `crates/gane-pubsub`
- `crates/gane-websocket`

### `src/ai_layer`

Conceptual responsibility:
- bounded AI decision support
- predictive analytics
- recommendation / explanation surfaces

Repository mapping:
- `apps/brainiac/`
- `frontend/client/src/components/AICopilot.tsx`
- `frontend/client/src/engine/`
- `crates/gane-ml`
- `crates/gane-predictive`
- `crates/gane-explain`

### `src/ui_polymorphic`

Conceptual responsibility:
- multi-device UI
- adaptive frontend surfaces
- admin, replay, trust, safety, product interaction

Repository mapping:
- `frontend/client/src/`
- `apps/trade/src/`
- `services/gane-platform/ui/`

## Integration Rules

### Unified namespace

- Rust workspace crates use `gane-*`
- product identity is `G.A.N.E NAV`
- legacy aliases are treated as migration debt, not canonical names

### Source of truth

- deterministic navigation truth lives in the Rust core
- platform truth for product/control-plane data lives in the backend surfaces
- imported archives are historical sources only until they are normalized into
  the monorepo structure

### Deterministic vs AI separation

- deterministic safety-critical logic belongs in the core/runtime layers
- AI stays advisory, bounded, and non-authoritative over safety-critical state
- UI explanation layers may consume AI outputs, but may not replace deterministic
  integrity or routing truth

### Archive integration

- `frontend/` is the normalized home of the imported web snapshot
- `apps/trade/` is the normalized home of the imported trade app snapshot
- root `.github/` and repository policies contain the shared governance files

## Verification Entry Point

Use `scripts/verify-unified-repo.ps1` to run the shared verification flow across
the actively maintained Node/TypeScript surfaces. Add Rust verification on top
when the relevant workspace slice is being changed.
