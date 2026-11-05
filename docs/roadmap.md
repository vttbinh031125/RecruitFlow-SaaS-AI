# Development roadmap

## Phase 1: Foundation — implemented

- pnpm monorepo, Next.js App Router, NestJS, shared contracts and local PostgreSQL.
- Prisma schema, committed initial migration and repeatable synthetic seed.
- Bcrypt and JWT cookie authentication, candidate registration and organization membership authorization.
- ESLint, Prettier, Jest and GitHub Actions workflow.

## Phase 2: Recruitment management — starter implemented

- Public job board/detail and candidate application submission.
- Recruiter job create/edit/publish/archive/delete, with deletion restricted when applications exist.
- Private candidate history, recruiter application lists, controlled stage changes.
- Real organization overview/funnel, recent applications and read-only settings.
- Browser workflows and API isolation tests.

Next: organization creation/invitations, candidate profile editing, stage audit history, scheduling, evaluations, search/filtering and private resume storage.

## Phase 3: AI resume analysis — demonstration implemented

- Injected provider interface and local mock implementation.
- Authorized analysis endpoint and explicitly synthetic output in the reviewer UI.
- Persisted demonstration records; no automated hiring decisions.

Next: opt-in external processing, consent records, secure extraction with human review, timeouts, usage limits, provenance and evaluation of real providers. Never automatically reject or hire applicants.

## Phase 4: SaaS features and deployment — pending

- Platform administration, plans/quotas, invitation management and usage reporting.
- Refresh-session rotation/revocation, email verification and password reset.
- Production containers, HTTPS routing, distributed limits, CSP, backups and recovery drills.
- CI execution on GitHub and a real deployment. The workflow is committed locally; no remote run or public deployment is claimed.

The starter delivers the initial end-to-end recruitment workflow. Production rollout is a separate milestone.
