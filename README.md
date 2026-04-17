# G.A.N.E NAV

**Global Autonomous Navigation Engine / Global Mobility Intelligence Network**

G.A.N.E NAV is a production-grade, modular navigation platform. It
unifies the codebases previously tracked as *AURORA NAV*, *GMIN*,
*G.A.N.E*, and several sibling React/Firebase prototypes into a single
repository.

This is a **polyglot monorepo**:

| Surface | Location | Stack | Role |
|---|---|---|---|
| Real-time core | `crates/` | Rust 1.83 (2,452 crates) | Positioning, fusion, integrity, routing, REST API |
| Full web stack | `frontend/` | React + Vite + Express + Drizzle + Playwright | Richer dashboard + Node API + E2E + load tests |
| Trade / ops app | `apps/trade/` | React 19 + Vite + Firebase + Leaflet | Standalone navigation / trade console |
| Brainiac agents | `apps/brainiac/` | React 19 + three.js + Python (Aegis / Brainiac) | AI agents + 3D overlays |

The Rust workspace is the **source of truth** for positioning, sensor
fusion, and integrity monitoring. The Node and React surfaces consume
`gane-api` (Axum) for the high-assurance real-time path and layer
their own product UX on top.

## Workspace Layout

```
gane-nav/
  crates/                 # Rust workspace — 2,452 gane-* crates
    gane-core/          #   Core types, coordinates, errors
    gane-gnss/          #   Multi-constellation GNSS receiver
    gane-fusion/        #   Extended Kalman Filter sensor fusion
    gane-integrity/     #   RAIM, protection levels, jamming/spoofing
    gane-routing/       #   A* / Dijkstra route planning
    gane-map/           #   Map data, tiles, matching
    gane-lane/          #   Lane-level guidance
    gane-traffic/       #   Real-time traffic flow
    gane-v2x/           #   Vehicle-to-Everything (DSRC/C-V2X)
    gane-indoor/        #   BLE beacon trilateration, magnetic fingerprinting
    gane-ar-nav/        #   Augmented Reality overlay, lane projection
    gane-api/           #   REST API server (Axum)
    gane-web/           #   Interactive web dashboard (Leaflet.js)
    gane-app/           #   Application orchestration
    gane-orchestrator/  #   Pipeline orchestrator
    ... (2,400+ more crates covering sensors, infra, UX, compliance, etc.)

  frontend/               # Node-based full-stack surface (gmin-spec snapshot)
    client/               #   React 18 + Vite + Tailwind + shadcn/ui
    server/               #   Express + OpenTelemetry + Drizzle
    shared/               #   Shared contracts / types
    drizzle/              #   SQL migrations
    e2e/                  #   Playwright scenarios
    load-tests/           #   k6 / Artillery load tests
    docs/                 #   APK_TWA_GUIDE, CANONICAL_BACKLOG, audit
    package.json          #   pnpm workspace root
    pnpm-lock.yaml        #   Node dependency lockfile
    …                     #   See frontend/README.md for full layout

  apps/
    trade/                # React 19 + Firebase + Leaflet navigation console
    brainiac/             # React 19 + three.js + Python backend (Aegis + Brainiac)

  services/
    gane-platform/        # Express + tRPC backend (RBAC, policy, trust, route
                          # explainer, offline sovereignty, release gate,
                          # regression sentinel, safety-UX, admin, billing)

  reference/              # Third-party source-level references (NOT built by CI)
    navigation2/          #   ROS 2 Navigation Stack snapshot (Apache-2.0)
                          #   See reference/README.md and
                          #   reference/navigation2/GANE_REFERENCE.md

  .github/workflows/      # CI: build, clippy, test, fmt, bench, doc (Rust only today)
  Cargo.toml              # Workspace manifest (2,452 unique members)
  Dockerfile              # Multi-stage release build for gane-app
  docker-compose.yml      # Local runtime for gane-nav
```

## Key Capabilities

### Positioning and Navigation
- **Multi-GNSS**: GPS, Galileo, GLONASS, BeiDou with per-signal quality scoring.
- **EKF Fusion**: Extended Kalman Filter combining GNSS, IMU, barometer,
  odometry, and map matching.
- **Continuity Manager**: automatic degraded-mode switching (Modes A–E)
  with graceful recovery and re-entry.
- **Tunnel / Urban Canyon Recovery**: dead reckoning with automatic GNSS
  handoff when signals return.
- **RTK / PPP / SBAS corrections** with RAIM integrity monitoring.
- **Indoor positioning**: BLE beacons, WiFi RTT, magnetic fingerprinting.

### Routing, Traffic, Risk
- Multi-modal routing: car, truck, EV, bicycle, pedestrian, transit.
- Probabilistic routing with ETA confidence intervals and volatility index.
- Lane-level guidance and corridor routing.
- Network-stability-aware flow control (anti-herding, corridor throttling).
- Per-segment risk scoring and safety-envelope routing.

### Integrity, Trust, Evidence
- Spoofing and jamming detection, satellite exclusion, per-source trust.
- Evidence capture with signed metadata and privacy blur.
- Anti-manipulation checks and algorithm-transparency logs.

### Communication & V2X
- Basic Safety Message (BSM), SPaT, GLOSA.
- Satellite store-and-forward for emergency packets.
- Mesh fallback over Bluetooth / Wi-Fi Direct.

### Infrastructure
- **2,452 modular crates**, independently testable.
- REST API (Axum) + WebSocket surface.
- Interactive Leaflet web dashboard (`gane-web`).
- Docker multi-stage build and compose for local runtime.
- Structured logging, distributed tracing, histograms, Prometheus metrics.

## Quick Start

### Prerequisites
- Rust 1.83+ (tested on 1.83.0)
- Cargo (included with Rust)
- Node 18+ and pnpm (only if working on `frontend/`)

### Build the workspace
```bash
cargo build --workspace
```

### Type-check only (fast)
```bash
cargo check --workspace
```

### Run the test suite
```bash
cargo test --workspace
```

### Run the API server
```bash
cargo run -p gane-api
```
The server starts on `http://localhost:3000`:
- `GET /` — web dashboard
- `GET /api/dashboard` — JSON telemetry
- `GET /health` — health check

### Lint & format
```bash
cargo clippy --all-targets -- -D warnings
cargo fmt --all -- --check
```

### Docker
```bash
docker compose up --build
```

## Crate Categories

| Category | Representative crates |
|---|---|
| Core | `gane-core`, `gane-events`, `gane-config`, `gane-errors` |
| GNSS / PNT | `gane-gnss`, `gane-multi-gnss`, `gane-ekf`, `gane-tunnel`, `gane-dual-freq` |
| Sensors | `gane-sensors`, `gane-fusion`, `gane-dead-reckoning`, `gane-imu-sensor` |
| Integrity | `gane-integrity`, `gane-continuity`, `gane-anti-manipulation`, `gane-anti-jam` |
| Routing | `gane-routing`, `gane-risk`, `gane-probabilistic`, `gane-multistop` |
| Traffic | `gane-traffic`, `gane-stability`, `gane-crowd-speed`, `gane-traffic-predict` |
| V2X | `gane-v2x`, `gane-v2v-comm`, `gane-v2i-comm`, `gane-v2p-safety` |
| Indoor / AR | `gane-indoor`, `gane-ar`, `gane-ar-nav` |
| Maps | `gane-map`, `gane-lane`, `gane-offline`, `gane-tiles`, `gane-map-match` |
| API / Web | `gane-api`, `gane-web`, `gane-websocket` |
| Fleet / EMS | `gane-fleet`, `gane-emergency`, `gane-emergency-sat` |
| Smart City | `gane-city`, `gane-twin`, `gane-intersection` |
| Infrastructure | `gane-cache`, `gane-pipeline`, `gane-mesh`, `gane-ratelimit` |
| Observability | `gane-telemetry`, `gane-metrics`, `gane-tracing-dist`, `gane-structured-log` |
| Security | `gane-auth`, `gane-security`, `gane-compliance`, `gane-audit` |

## Repository Conventions

- **Branches**: `main` (release), `devin/<timestamp>-<slug>` (work branches).
- **Never** commit release archives, PDFs, or `target/` artifacts — see
  `.gitignore`.
- Binary / rendered artifacts (`*.zip`, `*.tar*`, `*.pdf`) are blocked at
  the gitignore level to keep the repo lean.

## License

MIT.
