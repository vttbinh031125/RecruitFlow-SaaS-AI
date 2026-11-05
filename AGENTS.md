# RecruitFlow contributor instructions

These rules apply throughout the repository, including to subagents and external coding agents. Follow applicable directory-specific instructions as well.

## Project context and scope

- Use pnpm workspaces, Next.js App Router, NestJS, Prisma and PostgreSQL. Preserve the modular monolith and existing module boundaries.
- Read the current task, relevant source and applicable instructions before editing. Check `git status` and preserve existing user changes.
- README.md documents the starter; docs/architecture.md and docs/roadmap.md explain its architecture and remaining work. SPEC.md preserves the original product vision, including superseded Vite/Google OIDC plans; it does not describe all currently implemented behavior.
- Implement the current authorized task. The completed steps 1-8 are project history, not a permanent restriction on future work. Do not implement unrelated roadmap features without a new request.

## Git and external actions

- Never push to any remote without the user's explicit approval for that specific push.
- If approval is missing, summarize the commits, remote and target branch, then ask and wait for confirmation before running any push command or equivalent tool.
- Approval for an earlier push is not standing permission for later pushes. An explicit request to push the current changes counts as approval for that push only.
- Commit only when the user explicitly requests a commit. A request to fix or review code does not authorize committing or pushing.
- Do not merge, tag a release, publish, deploy, modify remote settings or change Git identity settings without explicit authorization for that action.
- Never force-push, rewrite history, discard user edits or run destructive Git commands without explicit approval for the exact operation.
- Before committing, review the staged diff and check that secrets, generated output, logs and test artifacts are excluded.

## Clarify unclear requests

- If you do not understand the user's intent, requirements or scope, ask a concise clarifying question before making changes that depend on the answer.
- Do not silently guess when different interpretations would change behavior, security, data or the amount of work. State the uncertainty and wait for the answer.
- While waiting, continue only clearly independent, reversible work that the user has already authorized.

## Implementation rules

- Make the smallest complete change. Reuse existing components, services and installed dependencies before adding new ones. Avoid unused abstractions, placeholder modules and speculative features.
- For a bug fix, inspect its callers and fix the shared root cause. Update affected callers, contracts, tests, configuration and documentation together.
- Preserve validation, error handling, accessibility and existing behavior outside the requested scope. Do not suppress errors or weaken tests merely to make checks pass.
- Verify dependency compatibility, update pnpm-lock.yaml when needed, and keep documented commands consistent with package.json.
- Reviews are read-only unless the user also asks for fixes. Report actionable findings with severity, file/line references and a concrete failure scenario; distinguish confirmed issues from unverified risks.

## Security and tenant isolation

- Validate DTOs and environment variables at trust boundaries. Keep secrets in ignored environment files; never commit or print real credentials, tokens, password hashes or private applicant data.
- Derive user identity from verified authentication. Check organization membership and permissions on every tenant operation, using the resource's actual organization relationship.
- Candidates may read only their own private applications. Public responses must explicitly select safe fields. Platform ADMIN is separate from organization roles and must not bypass tenant checks.
- Preserve short-lived HttpOnly cookie authentication and origin checks. Do not move tokens into localStorage or weaken cookie protections to work around a bug.
- AI must never automatically hire or reject candidates. Keep mock output visibly labeled; do not silently substitute fake data for failed requests.
- Do not activate external AI processing or send resumes to external providers without explicit authorization and appropriate consent/privacy controls.

## Database and local environment safety

- Preserve migration history and persistent volumes. Prefer additive migrations; never reset a database, drop tables, delete volumes or overwrite data without explicit approval for that exact action.
- Use dedicated databases ending in `_test` for integration/browser checks. Use synthetic fixtures and remove only test-owned records when cleanup is required.
- Never run development seeds against production. Preserve existing environment settings and account passwords during setup or seed updates.
- Start or stop only processes belonging to this task. Do not interrupt unrelated applications or change shared machine settings to resolve a local port conflict.

## Verification and reporting

- Add focused tests for new nontrivial behavior and regressions. Authentication, authorization, tenant isolation and recruitment transactions require meaningful security/integration coverage.
- For code changes, run affected tests plus lint, typecheck and build as appropriate. Available commands include `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm format:check`, `pnpm test:integration` and `pnpm test:e2e`.
- Documentation-only edits need formatting and diff checks, not a full application test run.
- If a tool, dependency, database or browser is unavailable, report the limitation and exact unverified checks. Never invent test results, screenshots, metrics, deployments or hosted CI outcomes.
- Finish with what changed, verification results and material remaining limitations. Keep README and roadmap claims aligned with actual behavior; do not describe the starter as production ready.
- Use subagents or external model reviewers only when explicitly requested. Give them the relevant repository rules and scoped work; they may not bypass approval or data-protection rules.
