# G.A.N.E NAV Security Policy

## Supported Surfaces

Security updates are currently applied to the active monorepo surfaces:

| Surface | Status |
| --- | --- |
| `crates/` Rust workspace | Supported |
| `frontend/` web stack | Supported |
| `services/gane-platform/` control plane service | Supported |
| `apps/trade/` standalone app | Supported |

Archived bundles, exported `.zip` files, generated artifacts, and historical
verification logs are not supported release channels.

## Reporting a Vulnerability

Please do not open public issues for undisclosed security findings.

Preferred path:
1. Use GitHub private vulnerability reporting for this repository if it is enabled.
2. If private reporting is unavailable, contact the repository maintainers through
   a private channel and include reproduction steps, impact, and affected paths.

Please include:
- affected component or directory
- exact commit or branch
- severity / impact assessment
- steps to reproduce
- suggested mitigation if known

We aim to acknowledge new security reports quickly and keep remediation
coordination private until a fix is available.
