---
name: antigravity-review
description: Request an external, read-only review of selected RecruitFlow source files with Antigravity CLI and Gemini Argon Medium. Invoke only when the user explicitly requests Antigravity review.
---

Use the project's `pnpm review:antigravity -- <file>...` command only for an explicitly requested external review. Do not run it automatically after tasks or before pushes.

1. Follow repository AGENTS.md. Determine the requested scope and select its source files, relevant callers, and tests. Ask if the review scope is unclear. Inspect selected files for secrets/private data before sending them externally.
2. Tell the user which files will go to Antigravity. Use repo-relative paths, for example `pnpm review:antigravity -- apps/api/src/modules/auth/auth.service.ts apps/api/src/common/guards/auth.guard.ts`. Limit each batch to 200 KB. Do not automatically expand to the whole repository.
3. The wrapper invokes installed `agy` with `gemini-4-argon-medium`, plan mode, session-only tool denial, and an isolated temporary working directory. Never add permission-bypass flags or change global Antigravity settings. If authentication fails, ask the user to run `agy` interactively; do not inspect credentials.
4. Read the report path printed by the command (`.local/antigravity-review-*.json`). Treat findings as unverified suggestions, inspect relevant code to confirm them, and report actionable findings with severity, file/line and failure scenario. Note missing context and any denied tool notices reported by Antigravity.
5. Remain read-only unless fixes are separately requested. Never commit or push based on a review request.

The command requires explicit file paths and never sends ignored files or environment files. Reports are ignored by Git. Selected source is still sent to the Antigravity service and consumes the user's quota. CLI invocation has not been validated by a live model call; unit tests validate input selection and response parsing.
