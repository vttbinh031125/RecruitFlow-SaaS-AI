# RecruitFlow – AI-Powered Recruitment SaaS

A fullstack portfolio project demonstrating a runnable recruitment workflow with Next.js, NestJS, PostgreSQL, tenant authorization, and an explicitly synthetic AI demonstration.

## Project Overview

Small and medium-sized companies need a clear view of open roles and candidate progress. RecruitFlow gives recruiters a shared organization workspace while candidates browse jobs, apply, and track their own applications. Hiring decisions remain with people.

## Key Features

See the [Software Requirements Specification](docs/requirements.md) for detailed requirements, acceptance criteria, and planned scope.

**Implemented**

- Candidate registration/login and recruiter login with bcrypt and HttpOnly JWT cookies.
- Organization-scoped job creation, editing, publishing, archiving and deletion with history protection.
- Public job board/details, candidate application submission and private application history.
- Recruiter review and controlled stage transitions, with cross-tenant authorization.
- Live dashboard counts/funnel, recent applications and read-only organization settings.
- Mock AI analysis, visibly labeled demonstration data; no real resume is processed.
- Prisma migration/seed, Swagger, validation, pagination, tests, Docker and CI configuration.

**Planned:** private resume upload, profile editing, organization invitations, interview scheduling, external AI processing with consent, platform administration, subscriptions, refresh sessions and deployment. Models for future features do not imply working endpoints.

## Technology Stack

| Layer            | Technologies                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Frontend         | Next.js 16 App Router, React, TypeScript, Tailwind, shadcn/ui component conventions, Radix, Lucide, React Hook Form, Zod |
| Backend          | NestJS 12, REST, class-validator, Swagger, bcrypt, JWT                                                                   |
| Database         | PostgreSQL 17, Prisma 7 with PostgreSQL driver adapter                                                                   |
| AI               | Injected provider interface and local mock adapter                                                                       |
| DevOps / quality | pnpm 10 workspace, Docker Compose, ESLint, Prettier, Jest, Playwright, GitHub Actions                                    |

The lockfile records exact versions. No external AI key is required.

## System Architecture

```mermaid
flowchart LR
 Browser --> Web[Next.js App Router]
 Web --> Proxy[Same-origin API proxy]
 Proxy --> API[NestJS modular monolith]
 API --> Auth[JWT and organization authorization]
 API --> Prisma[Prisma ORM]
 Prisma --> DB[(PostgreSQL)]
 API --> AI[AI provider interface]
 AI --> Mock[Local demonstration provider]
```

See [architecture and security decisions](docs/architecture.md).

## Database Design

```mermaid
erDiagram
 User ||--o{ OrganizationMember : joins
 Organization ||--o{ OrganizationMember : contains
 Organization ||--o{ Job : owns
 User ||--o| Candidate : has
 Candidate ||--o{ Application : submits
 Job ||--o{ Application : receives
 Candidate ||--o{ Resume : owns
 Application ||--o{ Interview : schedules
 Application ||--o{ AIAnalysis : has
```

Unique membership and candidate/job constraints prevent duplicates. Foreign keys protect recruitment history. See [database design](docs/database.md) and [Prisma schema](apps/api/prisma/schema.prisma).

## Project Structure

```text
apps/
  web/src/
    app/              Public, auth, and dashboard routes
    components/       Reusable UI, navigation, tables, and states
    features/         Auth, workspace, and job workflows
    hooks/            Remote-data loading with stale-result protection
    lib/              Same-origin API client and UI utilities
    types/            Frontend API contracts
  api/
    src/common/       Guards, decorators, validation and exception handling
    src/config/       Environment validation
    src/prisma/       Database lifecycle
    src/modules/      Auth, organizations, jobs, applications and AI
    prisma/           Schema, migration and synthetic seed
    test/             Unit and database integration tests
packages/shared/      Shared TypeScript contracts
docs/                 Architecture, database, API and roadmap
.github/workflows/    CI checks and browser workflows
```

## Getting Started

Requirements: Node.js 24 LTS, pnpm 10.34.9, Docker Desktop with Linux containers. The project is tested locally on Windows; CI is configured for Ubuntu.

From the repository root in PowerShell:

```powershell
npm install --global pnpm@10.34.9
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Copy the generated value into JWT_SECRET in `.env`. The example placeholder is rejected. Copy `.env` only on first setup; preserve existing settings. On macOS/Linux use `cp .env.example .env`.

```powershell
pnpm install --frozen-lockfile
pnpm db:up
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Environment Variables

| Variable                                        | Purpose                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB | Local container credentials and database                                 |
| POSTGRES_PORT                                   | Host PostgreSQL port, default 5433                                       |
| DATABASE_URL                                    | Prisma/API PostgreSQL connection                                         |
| API_PORT                                        | API port, default 3000                                                   |
| API_TARGET                                      | Next.js server-side proxy destination; set before building               |
| WEB_ORIGIN                                      | Exact trusted browser origin, default http://localhost:5173              |
| JWT_SECRET                                      | Unique random secret, at least 32 characters                             |
| NODE_ENV                                        | development/test/production; controls Secure cookies and seed protection |
| TEST_DATABASE_URL                               | Dedicated integration database ending in _test                           |
| E2E_BASE_URL                                    | Optional browser test origin, default http://localhost:5173              |

Use `localhost` consistently in the browser. Only example credentials belong in Git. Production requires fresh credentials, HTTPS and NODE_ENV=production.

## Running Locally

Open **http://localhost:5173**. Use the following synthetic development accounts:

| Account   | Email                      | Password            |
| --------- | -------------------------- | ------------------- |
| Recruiter | recruiter@recruitflow.test | RecruitFlowDemo123! |
| Candidate | candidate@recruitflow.test | RecruitFlowDemo123! |

The recruiter can create a published job at `/dashboard/jobs`. A candidate can apply from `/jobs/[id]` and track progress at `/dashboard/applications`. Recruiters review that application, change stages and generate a demo analysis.

The seed upserts one organization, both accounts, three jobs and three applications. It preserves existing passwords and refuses NODE_ENV=production. Never seed demo credentials into a production database.

`pnpm dev` starts Next.js with hot reload and compiles/starts the API. Restart it after API TypeScript changes. `pnpm db:down` stops PostgreSQL while preserving its named volume. No reset is required.

To run compiled applications locally: `pnpm build`, then `pnpm start`. Docker currently runs only PostgreSQL. Production hosting requires the additional work listed in the roadmap.

## API Documentation

Swagger: **http://localhost:5173/api/docs**. Health: **http://127.0.0.1:3000/api/health**.

| Group            | Main routes                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Auth             | POST /api/auth/register, /login, /logout; GET /api/auth/me                                                                             |
| Organizations    | GET /api/organizations; GET /api/organizations/:id/overview                                                                            |
| Jobs             | GET/POST /api/jobs; GET/PATCH/DELETE /api/jobs/:id; GET /api/organizations/:id/jobs                                                    |
| Applications     | POST /api/jobs/:id/applications; GET /api/applications/me; GET /api/organizations/:id/applications; PATCH /api/applications/:id/status |
| AI demonstration | POST /api/ai/resume-analysis                                                                                                           |

Lists return arrays and accept `page=1&limit=20` (maximum limit 100). The membership list is the authenticated user's organization selector. State-changing requests require the exact WEB_ORIGIN in the Origin header, including command-line calls. See [payloads and authorization rules](docs/api-spec.md).

## User Roles

- **Platform Admin:** modeled separately; administration screens/endpoints remain planned. This role never bypasses tenant authorization.
- **Recruiter / HR:** organization OWNER or RECRUITER membership permits job management, application review, stage changes, organization overview and demo AI.
- **Candidate:** public registration creates a candidate profile; candidates apply and see only their own private applications.

One user may belong to multiple organizations. Membership creation currently comes from seed data; invitation/onboarding workflows are planned.

## AI Integration Strategy

AIService authorizes the application relationship, then invokes the injected AIProvider. MockAIProvider ignores resume context and returns fixed examples with `demonstration: true` and a warning that no resume was analyzed. The API persists the demo result and never changes hiring status.

A future adapter can implement the provider contract. External processing is disabled and needs explicit consent, secure extraction with human review, timeouts, provenance and usage controls before activation. There is no scoring, automated rejection or automated hiring.

## Testing

```powershell
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @recruitflow/api exec prisma validate
```

Unit tests cover API guards, ownership scoping, configuration, transitions, mock AI authorization, health and frontend health handling. Backend Jest uses Node's experimental VM modules support for NestJS ESM dependencies; the associated warning is expected.

For database integration tests, create a dedicated database once:

```powershell
docker compose exec postgres createdb -U recruitflow recruitflow_test
$env:TEST_DATABASE_URL='postgresql://recruitflow:recruitflow_local@127.0.0.1:5433/recruitflow_test'
$env:DATABASE_URL=$env:TEST_DATABASE_URL
pnpm db:migrate
Remove-Item Env:DATABASE_URL
pnpm --filter @recruitflow/api build
pnpm test:integration
```

Tests use two organizations and separate candidates, then remove only their own synthetic fixtures. They check cross-tenant access, duplicate applications, private reads, transitions, origin/cookie handling, overview counts and AI isolation. Do not run them against a real business database.

For browser tests, use a separate seeded database in a separate terminal session. Stop the currently running app first so ports 3000/5173 are available:

```powershell
docker compose exec postgres createdb -U recruitflow recruitflow_e2e_test
$env:DATABASE_URL='postgresql://recruitflow:recruitflow_local@127.0.0.1:5433/recruitflow_e2e_test'
pnpm db:migrate
pnpm db:seed
pnpm build
pnpm start
```

Then, from another terminal:

```powershell
pnpm --filter @recruitflow/web exec playwright install chromium
pnpm test:e2e
```

Browser tests add synthetic E2E roles/applications to that dedicated database and test both sessions, human stage updates, demonstration AI, protected-page redirects, visible API failures and mobile width. Stop the servers and remove the session's DATABASE_URL override to return to the normal `.env` database. `createdb` is a one-time step; skip it when the named database already exists.

[GitHub Actions](.github/workflows/ci.yml) configures install, migration, schema validation, lint, formatting, typecheck, Jest, builds, integration tests, seed and Chromium workflows with PostgreSQL. A hosted run is not claimed until the workflow runs on GitHub.

### On-demand Antigravity review

With authenticated Antigravity CLI (`agy`) on PATH, review selected source files using Gemini Argon Medium:

```powershell
pnpm review:antigravity -- apps/api/src/modules/auth/auth.service.ts apps/api/src/common/guards/auth.guard.ts
```

The project Codex skill `$antigravity-review` invokes the same command only when explicitly requested. It is not an automatic stop, commit or push hook. If the skill is not visible, reopen the Codex session; the terminal command is available immediately.

Only selected text files are sent externally (maximum 200 KB). Environment files, ignored paths and files outside the repository are rejected. Inspect files for sensitive content before selecting them. Antigravity runs in an isolated temporary working directory with session-only denial of file, command, web and MCP tools. It cannot run tests or inspect missing context; Codex must verify its findings. No global settings are modified. Calls use your Antigravity quota, and reports are saved to ignored `.local/antigravity-review-*.json`.

Run `pnpm test:review-hook` for input-boundary and response-parser tests without contacting a model. A live model call is not claimed as part of this setup.

## Development Roadmap

1. **Foundation:** implemented workspace, database, auth and tooling.
2. **Recruitment management:** implemented starter job/application workflows; interviews, invitations and uploads are next.
3. **AI resume analysis:** mock demonstration implemented; consent-based real processing is planned.
4. **SaaS and deployment:** plans, administration, session hardening, backups and hosting remain planned.

See [detailed roadmap](docs/roadmap.md).

## Screenshots / Demo

Actual screenshots captured from the Chromium workflow with synthetic data:

![Recruiter application review and demonstration AI](docs/screenshots/applications-desktop.png)

[Mobile job board screenshot](docs/screenshots/jobs-mobile.png)

Public hosting and a recorded demo are not available. No deployment URL is claimed.

## Engineering Decisions

- **Monorepo:** one install/lockfile and coordinated frontend/API changes.
- **NestJS:** explicit modules, dependency injection and DTO validation keep responsibilities understandable.
- **PostgreSQL:** relational constraints and transactions protect recruitment data.
- **Modular monolith:** supports one developer without distributed-system overhead.
- **Multi-tenancy:** organization membership and relationship-based server checks isolate workspaces while allowing candidates to apply across companies.

Security remains an MVP foundation: logout clears cookies but copied JWTs remain valid until expiry. Refresh/revocation, password reset, email verification, audit logging, distributed rate limiting, full CSP, production containers, HTTPS setup and backup/recovery work are deferred. The platform is not claimed to be production ready.

## Author

GitHub: [vttbinh031125](https://github.com/vttbinh031125) ? Repository: [RecruitFlow-SaaS-AI](https://github.com/vttbinh031125/RecruitFlow-SaaS-AI).

## License

[MIT](LICENSE). Dependencies retain their respective licenses.
