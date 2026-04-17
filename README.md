# G.A.N.E NAV

**Global Autonomous Navigation Engine / Global Mobility Intelligence Network**

G.A.N.E NAV is a production-grade, modular navigation platform built as a
Cargo workspace of `aurora-*` crates. It unifies the codebases previously
tracked as *AURORA NAV*, *GMIN*, and *G.A.N.E* into a single repository:

- The Rust workspace in `crates/` — positioning, sensor fusion, integrity
  monitoring, routing, traffic, V2X, indoor / AR navigation, the REST API
  server, and the Leaflet-based web dashboard.
- The `frontend/` directory — a React / TypeScript client snapshot that
  pairs with `aurora-api` for a richer dashboard experience. See
  [`frontend/README.md`](frontend/README.md) for its current status.

## Workspace Layout

```
gane-nav/
  crates/
    aurora-core/          # Core types, coordinates, errors
    aurora-gnss/          # Multi-constellation GNSS receiver
    aurora-fusion/        # Extended Kalman Filter sensor fusion
    aurora-integrity/     # RAIM, protection levels, jamming/spoofing
    aurora-routing/       # A* / Dijkstra route planning
    aurora-map/           # Map data, tiles, matching
    aurora-lane/          # Lane-level guidance
    aurora-traffic/       # Real-time traffic flow
    aurora-v2x/           # Vehicle-to-Everything (DSRC/C-V2X)
    aurora-indoor/        # BLE beacon trilateration, magnetic fingerprinting
    aurora-ar-nav/        # Augmented Reality overlay, lane projection
    aurora-api/           # REST API server (Axum)
    aurora-web/           # Interactive web dashboard (Leaflet.js)
    aurora-app/           # Application orchestration
    aurora-orchestrator/  # Pipeline orchestrator
    ... (2,400+ more crates covering sensors, infra, UX, compliance, etc.)
  frontend/               # React/TypeScript dashboard snapshot
    src/                  # Component snapshot (see frontend/README.md)
    docs/                 # Historical status reports from the import
  .github/workflows/      # CI: build, clippy, test, fmt, bench, doc
  Cargo.toml              # Workspace manifest (2,452 unique members)
  Dockerfile              # Multi-stage release build for aurora-app
  docker-compose.yml      # Local runtime for aurora-nav
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
- Interactive Leaflet web dashboard (`aurora-web`).
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
cargo run -p aurora-api
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
| Core | `aurora-core`, `aurora-events`, `aurora-config`, `aurora-errors` |
| GNSS / PNT | `aurora-gnss`, `aurora-multi-gnss`, `aurora-ekf`, `aurora-tunnel`, `aurora-dual-freq` |
| Sensors | `aurora-sensors`, `aurora-fusion`, `aurora-dead-reckoning`, `aurora-imu-sensor` |
| Integrity | `aurora-integrity`, `aurora-continuity`, `aurora-anti-manipulation`, `aurora-anti-jam` |
| Routing | `aurora-routing`, `aurora-risk`, `aurora-probabilistic`, `aurora-multistop` |
| Traffic | `aurora-traffic`, `aurora-stability`, `aurora-crowd-speed`, `aurora-traffic-predict` |
| V2X | `aurora-v2x`, `aurora-v2v-comm`, `aurora-v2i-comm`, `aurora-v2p-safety` |
| Indoor / AR | `aurora-indoor`, `aurora-ar`, `aurora-ar-nav` |
| Maps | `aurora-map`, `aurora-lane`, `aurora-offline`, `aurora-tiles`, `aurora-map-match` |
| API / Web | `aurora-api`, `aurora-web`, `aurora-websocket` |
| Fleet / EMS | `aurora-fleet`, `aurora-emergency`, `aurora-emergency-sat` |
| Smart City | `aurora-city`, `aurora-twin`, `aurora-intersection` |
| Infrastructure | `aurora-cache`, `aurora-pipeline`, `aurora-mesh`, `aurora-ratelimit` |
| Observability | `aurora-telemetry`, `aurora-metrics`, `aurora-tracing-dist`, `aurora-structured-log` |
| Security | `aurora-auth`, `aurora-security`, `aurora-compliance`, `aurora-audit` |

## Repository Conventions

- **Branches**: `main` (release), `devin/<timestamp>-<slug>` (work branches).
- **Never** commit release archives, PDFs, or `target/` artifacts — see
  `.gitignore`.
- Binary / rendered artifacts (`*.zip`, `*.tar*`, `*.pdf`) are blocked at
  the gitignore level to keep the repo lean.

## License

MIT.
