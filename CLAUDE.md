# Claude Code Handoff Entry

Start here: `docs/CLAUDE_CODE_HANDOFF.md`.

This repository is being normalized to the canonical product identity
`G.A.N.E NAV`.

Hard rules for continuation:
- Use `G.A.N.E` / `G.A.N.E NAV` only as the product identity.
- Treat legacy aliases as migration debt, not canonical names.
- Do not claim completeness where runtime proof is missing.
- Do not remove or overwrite user work without checking current git state.
- Prefer extending the existing monorepo layout instead of creating new
  parallel trees.

Current local branch:
- `devin/1776397393-gane-nav-unify`

Current continuation context:
- Do not assume remote or local branch position from this file alone.
- For the exact live branch state, always run:
  - `git status -sb`
  - `git log --oneline --decorate -10`
- The shared Node/TypeScript verification flow is:
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-unified-repo.ps1`
- The primary open handoff and status document is:
  `docs/CLAUDE_CODE_HANDOFF.md`.
