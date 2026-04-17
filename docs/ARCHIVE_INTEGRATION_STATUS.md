# G.A.N.E NAV Archive Integration Status

This document tracks how the provided archive sources map into the live
repository.

## Integrated Sources

| Source archive | Live repository target | Status | Notes |
| --- | --- | --- | --- |
| Frontend snapshot archive A | `frontend/` | Integrated | Source is represented in the live frontend tree. Only generated `test-results/.last-run.json` was intentionally excluded. |
| Frontend snapshot archive B | `frontend/` | Integrated | Duplicate source of the same frontend snapshot. |
| Trade application snapshot | `apps/trade/` | Integrated | Source matches the `apps/trade/` subtree. |
| Monorepo navigation snapshot A | repository root after namespace migration | Integrated | Content is represented in the live monorepo after canonical namespace normalization. |
| Monorepo navigation snapshot B | repository root after namespace migration | Integrated | Remaining governance files were imported separately into root `.github/` and `SECURITY.md`. |
| Verification bundle | no code delta | Reviewed | Contains an archive wrapper and verification log, not additional source modules. |

## Remaining Non-Source Artifacts

The following classes of files are intentionally not re-imported as source:

- nested release archives (`*.zip`)
- generated verification outputs
- duplicate snapshots already normalized into the monorepo

## Governance Files Imported During Integration

The following missing repository-level files were restored as part of archive
integration:

- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/ISSUE_TEMPLATE/custom.md`
- `SECURITY.md`

## Ongoing Rule

New archive imports should be normalized into existing monorepo targets rather
than copied into parallel top-level trees. The live repository remains the only
maintained source of truth.
