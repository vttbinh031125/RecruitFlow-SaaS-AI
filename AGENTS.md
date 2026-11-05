# RecruitFlow contributor instructions

Use pnpm workspaces, Next.js App Router, NestJS, Prisma and PostgreSQL.
The current scope includes plan steps 1-8: the runnable starter, mock AI, dashboard, documentation, CI and verification.
The latest user specification supersedes the original Vite/Google OIDC Week 1 brief. SPEC.md preserves the original product vision; README.md documents current behavior.
Validate DTOs, environment variables, membership roles and candidate ownership on the server. Never expose password hashes, trust client identities, or bypass tenant checks for platform admins.
Use short-lived HttpOnly cookie JWTs and origin validation. Refresh rotation and production session management remain future work.
AI never makes hiring decisions. Mock AI is authorized; real external AI processing, billing and interview endpoints remain deferred.
Run lint, typecheck, Jest tests and builds. Run database integration checks against a dedicated test database. Do not reset databases or delete volumes.
