# navigation2 — G.A.N.E NAV reference mapping

This is an upstream snapshot of the ROS 2 Navigation Stack
([ros-navigation/navigation2](https://github.com/ros-navigation/navigation2),
Apache-2.0). It lives under `reference/` and is **not built or tested**
by G.A.N.E CI. See [`reference/README.md`](../README.md) for policy.

The table below maps each top-level `nav2_*` package to the G.A.N.E
NAV crate or service it corresponds to conceptually. Use it when
porting algorithms or reviewing API shapes — **never** use it as a
list of files to import verbatim.

## Package → G.A.N.E concept map

| `navigation2/` package | G.A.N.E equivalent | Notes |
|---|---|---|
| `nav2_core` | `crates/gane-core` | Core abstract plugin interfaces (planner, controller, costmap, smoother, recovery). |
| `nav2_costmap_2d` | `crates/gane-map`, `crates/gane-risk` | Layered occupancy / inflation / keepout costmaps. G.A.N.E uses map graphs + per-segment risk scores instead of 2D grids for road use-cases. |
| `nav2_planner` | `crates/gane-routing` | Global planner server (NavFn, SMAC, Theta*). |
| `nav2_navfn_planner` | `crates/gane-routing` (A*/Dijkstra path) | Dijkstra / A* on a 2D grid. |
| `nav2_smac_planner` | `crates/gane-routing` (hybrid-A*) | Hybrid-A* / state lattice / Dubins / Reeds-Shepp — reference for future kinematic planners. |
| `nav2_theta_star_planner` | `crates/gane-routing` | Any-angle planner — reference for line-of-sight smoothing. |
| `nav2_route` | `crates/gane-routing`, `crates/gane-lane` | Lane-graph / corridor routing. |
| `nav2_controller` | `crates/gane-lane`, `crates/gane-ar-nav` | Local controller server; G.A.N.E uses lane-guidance + AR overlay rather than velocity commands. |
| `nav2_dwb_controller` | n/a (robotics-specific) | DWB local planner — reference only. |
| `nav2_mppi_controller` | n/a (robotics-specific) | MPPI local planner — reference only. |
| `nav2_regulated_pure_pursuit_controller` | n/a (robotics-specific) | Pure pursuit — reference only. |
| `nav2_rotation_shim_controller` | n/a | In-place rotation wrapper — reference only. |
| `nav2_graceful_controller` | `crates/gane-continuity` | Graceful approach/departure — relevant to fail-safe continuity transitions. |
| `nav2_smoother` | `crates/gane-routing` (post-process step) | Path smoothing algorithms. |
| `nav2_velocity_smoother` | n/a | Ramp / low-pass velocity smoothing — reference only. |
| `nav2_behavior_tree` | `crates/gane-orchestrator` | Behaviour trees for mission orchestration. G.A.N.E uses explicit state machines + event bus. |
| `nav2_behaviors` | `crates/gane-continuity`, `crates/gane-orchestrator` | Recovery behaviours (spin, backup, wait). |
| `nav2_recoveries` | `crates/gane-continuity` | Recovery manager. |
| `nav2_waypoint_follower` | `crates/gane-routing`, `crates/gane-multistop` | Multi-waypoint execution. |
| `nav2_following` | `crates/gane-micro-nav` | Leader-following controller. |
| `nav2_map_server` | `crates/gane-map`, `crates/gane-tiles` | Map loader / server. |
| `nav2_lifecycle_manager` | `crates/gane-orchestrator`, `crates/gane-pipeline` | Lifecycle bring-up / shutdown; G.A.N.E uses supervisor + actor lifecycle. |
| `nav2_amcl` | `crates/gane-fusion`, `crates/gane-integrity` | Adaptive Monte Carlo localisation; G.A.N.E uses EKF fusion + integrity monitoring. |
| `nav2_collision_monitor` | `crates/gane-anti-manipulation`, `crates/gane-integrity` | Polygon / footprint collision monitoring — reference for safety envelopes. |
| `nav2_docking` | n/a (robotics-specific) | Autonomous docking — reference only. |
| `nav2_loopback_sim` | n/a | Simulation harness — reference only. |
| `nav2_simple_commander` | `crates/gane-api` (Axum), `frontend/server` | High-level commander API — reference for REST/RPC shape. |
| `nav2_rviz_plugins` | `crates/gane-web`, `frontend/` | Visualisation — reference only. |
| `nav2_util` | `crates/gane-core`, `crates/gane-telemetry` | Misc utilities. |
| `nav2_msgs`, `nav2_ros_common` | `crates/gane-api` types, `crates/gane-events` | Message / action definitions. |
| `nav2_voxel_grid` | n/a | 3D voxel occupancy — reference only. |
| `nav2_system_tests` | `crates/gane-api/tests`, E2E suites | Integration tests. |
| `nav2_bringup` | `docker-compose.yml`, launch configs | Bring-up files. |

## Build / test

**Do not attempt to build this tree inside the G.A.N.E workspace.** It
requires a full ROS 2 toolchain (`colcon`, `rosdep`, `ament_cmake`,
Gazebo, RViz) and `nav2_msgs` / transitive ROS 2 dependencies. If you
need to build or run it, do so in a dedicated ROS 2 workspace outside
this repository.

## Licence / attribution

Licensed under Apache-2.0. Original copyright holders are documented
per-package inside each subdirectory. This snapshot is retained for
reference and study; do not redistribute under any other licence.
