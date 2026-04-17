# reference/

Third-party / upstream navigation codebases preserved at source-level as
**design references** for G.A.N.E NAV. Nothing under `reference/` is
built by the G.A.N.E workspace toolchain (Cargo / pnpm). It is **not**
part of the runtime system.

Use these trees as:

- Algorithm cross-checks (planners, costmaps, smoothers, recovery
  behaviors).
- API/message shape references for future adapters.
- A known-good corpus of automated tests that we can port into
  G.A.N.E-native test suites when we re-implement equivalent
  functionality in Rust.

The reference trees are excluded from CI (`.github/workflows/*.yml`
jobs operate only on `crates/`, `frontend/`, `apps/*`, and
`services/*`).

## Contents

| Path | Upstream | License | Purpose |
|---|---|---|---|
| `navigation2/` | [ros-navigation/navigation2](https://github.com/ros-navigation/navigation2) | Apache-2.0 | Reference implementation of a production-grade robotics navigation stack (ROS 2). Used as a conceptual cross-check for G.A.N.E's planners, controllers, smoothers, costmaps, and lifecycle orchestration. |

## Policy

- **Do not modify files under `reference/` as part of feature work.**
  If you need to change behaviour, port the concept into a G.A.N.E
  module (Rust crate or Node service) and cite the reference.
- Upstream updates: refresh by replacing the entire subtree with a
  fresh snapshot and documenting the upstream commit/tag in that
  reference's local README.
- Reference trees are deliberately source-level (not git submodules)
  so the monorepo is self-contained and offline-buildable for the
  parts we actually build.
