# RecruitFlow SaaS AI — Software Requirements Specification (SRS)

> **Version:** 1.0
>
> **Baseline date:** 2026-11-06
>
> **Project:** RecruitFlow — AI-Powered Recruitment SaaS
>
> **Status:** Current starter requirements + phased roadmap
>
> **Audience:** Developers, reviewers, testers, AI coding agents and project stakeholders

## 1. Purpose

RecruitFlow is a multi-tenant recruitment SaaS application for small and medium-sized organizations. Recruiters create and manage jobs, review candidate applications and monitor pipelines. Candidates browse published jobs, apply and track their own applications. AI features assist human reviewers but must never make hiring decisions.

This document defines functional requirements, non-functional requirements, access rules, validation criteria and future scope. It separates **implemented** features from **planned** features; it does not claim that the starter is production-ready.

### 1.1 Requirement conventions

- **FR**: functional requirement; **DR**: data requirement; **NFR**: non-functional requirement; **AC**: acceptance scenario.
- **P0:** starter MVP essential; **P1:** next phase; **P2:** future enhancement.
- **Implemented:** present in the repository's documented starter; execution should still be verified with tests.
- **Planned:** intended next-phase work, not yet delivered end to end.
- **Future:** later SaaS/production capability or goal.
- **Target:** measurable goal proposed for future validation, not a measured result.

## 2. Product vision and goals

1. Provide a working end-to-end workflow from job publishing through human candidate review.
2. Isolate private recruitment data by organization and candidate ownership.
3. Permit users to belong to multiple organizations without leaking tenant data.
4. Use maintainable fullstack architecture suitable for a fresher/intern portfolio.
5. Demonstrate a safe, clearly synthetic AI provider integration.
6. Establish foundations for invitations, resumes, interviews and SaaS production capabilities.

### 2.1 Starter MVP acceptance

The MVP is demonstrable when, using synthetic local accounts, an authorized recruiter can publish a job; a candidate can view it, apply once, and follow the application; the recruiter can review and advance permitted stages; dashboard counts reflect actual organization data; mock AI returns explicitly synthetic output without changing hiring status; and cross-tenant/ownership violations are rejected.

## 3. Actors and permissions

| Actor                              | Responsibilities                                                  | Scope now                                                             |
| ---------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| Visitor                            | Discover opportunities                                            | Public published jobs only                                            |
| Candidate                          | Register, log in, apply, track applications                       | Own candidate information and applications                            |
| Organization recruiter (RECRUITER) | Manage jobs, review applications, view overview and mock AI       | Organizations of which user is a member                               |
| Organization owner (OWNER)         | Same current recruiting access; later manage organization/members | Own organization membership                                           |
| Platform administrator (ADMIN)     | Later platform operations                                         | Role modeled; no operating admin endpoints or automatic tenant bypass |
| Developer/tester                   | Run, validate and extend the application                          | Synthetic seeds, migrations, tests and tooling                        |

**Tenant:** Organization. **Application:** a Candidate's submission to a Job. **AI demo:** a fixed synthetic response, not a real resume assessment.

## 4. Scope

### 4.1 Included in current MVP

- Candidate registration and login; recruiter login; JWT HttpOnly cookie sessions.
- Public job list/details; recruiter create, edit, publish, archive and protected delete.
- Candidate application submission and private history.
- Recruiter organization-scoped applications and controlled stage transitions.
- Organization overview with real counts/funnel, recent applications and read-only settings.
- Membership-based organization selection and application-level tenant isolation.
- Persisted, labeled mock AI analysis; no external AI key needed.
- PostgreSQL schema/migrations, safe synthetic seed, Swagger, tests, local Docker PostgreSQL and CI configuration.

### 4.2 Out of starter scope

- Self-service organization creation, invitations, role editing.
- Candidate profile editing, private resume upload/extraction, search/filter UI.
- Interview scheduling/evaluations, stage audit trails and notifications.
- Real AI resume analysis and consent/data governance.
- Subscriptions, billing, quotas and platform-admin UI.
- Refresh sessions/revocation, password reset, verification and production hosting.

### 4.3 Explicit exclusions

RecruitFlow must not automatically reject, hire or rank candidates. It must not publicly expose resumes, private applications or AI results. Future database models do **not** imply implemented APIs or UI workflows. The starter must not be described as production-certified.

## 5. Functional requirements

### 5.1 Authentication and account management

| ID         | Priority | Status      | Requirement and verifiable outcome                                                                                                                        |
| ---------- | -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-AUTH-01 | P0       | Implemented | Visitors can register a candidate with full name, validated unique normalized email and password. Registration does not automatically log them in.        |
| FR-AUTH-02 | P0       | Implemented | Existing users can log in with email and password; bcrypt validates the stored hash, and a JWT is sent only in an HttpOnly cookie.                        |
| FR-AUTH-03 | P0       | Implemented | Authenticated users can retrieve a safe user profile; hash and token are not returned in JSON.                                                            |
| FR-AUTH-04 | P0       | Implemented | Logout clears the authentication cookie; this does not invalidate any previously copied, unexpired JWT.                                                   |
| FR-AUTH-05 | P0       | Implemented | Invalid login, missing authentication, invalid input and unauthorized access return appropriate errors. Public registration cannot assign elevated roles. |
| FR-AUTH-06 | P1       | Planned     | Secure password reset and email verification use expiring, single-use tokens.                                                                             |
| FR-AUTH-07 | P1       | Planned     | Refresh-session rotation, logout-all and revocation allow long-lived sessions to be terminated safely.                                                    |

**Current session rules:** 15-minute access JWT; HttpOnly, SameSite=Strict cookie scoped to `/api`; Secure attribute in production; password length 12–72 characters and maximum 72 UTF-8 bytes. A strong unique JWT secret is required.

### 5.2 Organization and tenancy

| ID        | Priority | Status      | Requirement and verifiable outcome                                                                                |
| --------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| FR-ORG-01 | P0       | Implemented | Authenticated users list only organizations for which they hold a membership.                                     |
| FR-ORG-02 | P0       | Implemented | Recruiter actions require OWNER or RECRUITER membership in the organization that owns the target job/application. |
| FR-ORG-03 | P0       | Implemented | Switching organizations never reveals another tenant's private jobs, applications or dashboard counts.            |
| FR-ORG-04 | P0       | Implemented | Recruiters can view organization-specific overview and read-only settings.                                        |
| FR-ORG-05 | P1       | Planned     | Users can create organizations and owners can invite users with validated, expiring invitations.                  |
| FR-ORG-06 | P1       | Planned     | Owners can manage roles/members while preserving at least one owner per organization.                             |
| FR-ORG-07 | P2       | Future      | Admin actions are separately authorized and auditable; ADMIN must not implicitly bypass tenant checks.            |

**Current limitation:** memberships are provisioned through seed data, not invitation APIs.

### 5.3 Jobs and public job board

| ID        | Priority | Status      | Requirement and verifiable outcome                                                                                         |
| --------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| FR-JOB-01 | P0       | Implemented | Visitors can list/view PUBLISHED jobs only; DRAFT and ARCHIVED jobs are not public.                                        |
| FR-JOB-02 | P0       | Implemented | Authorized recruiters create jobs with title, description, requirements, location, employment type and status.             |
| FR-JOB-03 | P0       | Implemented | Authorized recruiters can edit, publish or archive their organization's jobs only.                                         |
| FR-JOB-04 | P0       | Implemented | Deleting a job with existing applications is rejected with a conflict, preserving recruitment history.                     |
| FR-JOB-05 | P0       | Implemented | Recruiter organization job lists include permitted non-public jobs; public responses omit private candidates/applications. |
| FR-JOB-06 | P0       | Implemented | Job listing supports validated page/limit and stable ordering.                                                             |
| FR-JOB-07 | P1       | Planned     | Public jobs can be searched and filtered by relevant properties, with sensible empty states.                               |

**EmploymentType:** FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP. **JobStatus:** DRAFT, PUBLISHED, ARCHIVED.

### 5.4 Applications and hiring pipeline

| ID        | Priority | Status      | Requirement and verifiable outcome                                                                        |
| --------- | -------- | ----------- | --------------------------------------------------------------------------------------------------------- |
| FR-APP-01 | P0       | Implemented | An authenticated candidate can apply to a published job.                                                  |
| FR-APP-02 | P0       | Implemented | The same candidate cannot apply to the same job twice, including during concurrent requests.              |
| FR-APP-03 | P0       | Implemented | Candidates view only their own application histories; arbitrary candidate IDs cannot expose others' data. |
| FR-APP-04 | P0       | Implemented | Recruiters view applications only for jobs owned by an authorized organization.                           |
| FR-APP-05 | P0       | Implemented | Stage changes must follow backend-controlled transitions; the API returns allowedNextStatuses.            |
| FR-APP-06 | P0       | Implemented | Invalid or conflicting stage changes fail without overwriting an accepted status.                         |
| FR-APP-07 | P1       | Planned     | Stage history captures previous/new stage, actor, timestamp and reason where appropriate.                 |
| FR-APP-08 | P1       | Planned     | Recruiters can enter private review feedback/evaluations scoped to their organization.                    |

**Pipeline:** APPLIED → SCREENING → INTERVIEW → OFFER → HIRED. REJECTED is allowed from any nonterminal stage. HIRED and REJECTED are terminal. AI output must never change these statuses.

### 5.5 Recruitment dashboard

| ID         | Priority | Status      | Requirement and verifiable outcome                                                     |
| ---------- | -------- | ----------- | -------------------------------------------------------------------------------------- |
| FR-DASH-01 | P0       | Implemented | Organization overview returns actual totals for jobs, published jobs and applications. |
| FR-DASH-02 | P0       | Implemented | Funnel reports every defined stage, including zero-count stages.                       |
| FR-DASH-03 | P0       | Implemented | Recent applications and organization selector follow membership authorization.         |
| FR-DASH-04 | P1       | Planned     | Recruiters can filter metrics by date without crossing tenant boundaries.              |

### 5.6 AI-assisted review

| ID       | Priority | Status      | Requirement and verifiable outcome                                                                                                                                |
| -------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-AI-01 | P0       | Implemented | A recruiter may request analysis by application ID only when authorized for that application's organization.                                                      |
| FR-AI-02 | P0       | Implemented | The mock provider emits fixed synthetic summary/skill examples, sets demonstration=true and never reads a real resume.                                            |
| FR-AI-03 | P0       | Implemented | Mock results are stored as private analysis records and do not alter application stage.                                                                           |
| FR-AI-04 | P0       | Implemented | An injected provider interface separates analysis orchestration from the synthetic implementation.                                                                |
| FR-AI-05 | P1       | Planned     | Real AI processing is opt-in and unavailable until explicit consent, secure extraction, access controls, provenance, budgets/limits and retention policies exist. |
| FR-AI-06 | P1       | Planned     | Live AI outputs disclose limitations and source/provenance, remain reviewable, and never automatically hire/reject/rank applicants.                               |
| FR-AI-07 | P2       | Future      | Evaluate accuracy, privacy risks, quality and fairness before broadening live AI use.                                                                             |

### 5.7 Resumes, interviews and SaaS extensions

| ID         | Priority | Status  | Requirement and verifiable outcome                                                                     |
| ---------- | -------- | ------- | ------------------------------------------------------------------------------------------------------ |
| FR-RES-01  | P1       | Planned | Candidates privately upload supported resumes with file-type, size and malicious-content controls.     |
| FR-RES-02  | P1       | Planned | Resume access is authorized for its owner and specifically permitted reviewers; no public object URLs. |
| FR-RES-03  | P1       | Planned | Candidates edit permitted profile information without changing ownership.                              |
| FR-INT-01  | P1       | Planned | Authorized recruiters schedule, reschedule and cancel interviews for their applications.               |
| FR-INT-02  | P1       | Planned | Candidates view their interview schedule; private recruiter feedback is not exposed by default.        |
| FR-SAAS-01 | P2       | Future  | Plan entitlements, quotas, usage reports and subscriptions are applied per organization.               |
| FR-SAAS-02 | P2       | Future  | Platform administration, notifications, audit views and operations support a production SaaS.          |

**Note:** Resume, Interview and PlatformRole exist in Prisma already. This does not mean these user-facing workflows are implemented.

## 6. Data requirements

| ID    | Priority | Status      | Requirement                                                                                                                           |
| ----- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| DR-01 | P0       | Implemented | Store User, Organization, OrganizationMember, Job, Candidate, Application, Resume, Interview and AIAnalysis in PostgreSQL via Prisma. |
| DR-02 | P0       | Implemented | Use UUID primary keys, unique user email and organization slug, and unique (userId, organizationId) membership.                       |
| DR-03 | P0       | Implemented | Enforce unique (jobId, candidateId) application at database level.                                                                    |
| DR-04 | P0       | Implemented | Foreign keys and restrictive deletes protect recruitment history.                                                                     |
| DR-05 | P0       | Implemented | Ownership derives from authenticated user and related job organization, never client-supplied tenant claims alone.                    |
| DR-06 | P0       | Implemented | Apply versioned Prisma migrations and upsert synthetic seed safely; seed must refuse production and preserve existing passwords.      |
| DR-07 | P1       | Planned     | Define data classification, retention, deletion/export and access auditing before private resume processing.                          |
| DR-08 | P1       | Planned     | Record consent and provenance for any real external AI processing.                                                                    |

**Relationships:** User → OrganizationMember → Organization → Job → Application ← Candidate ← User. Resume belongs to Candidate; Interview and AIAnalysis belong to Application.

Current tenant isolation is enforced in NestJS, **not** with PostgreSQL Row-Level Security. Database credentials must remain private and privileged.

## 7. Non-functional requirements

Goals marked _Target_ must be evaluated before being claimed as achieved.

| ID           | Priority | Status      | Requirement and verification                                                                                                                                                                        |
| ------------ | -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-SEC-01   | P0       | Implemented | Use bcrypt hashes, signature/expiry-validated JWT, HttpOnly cookies, route guards and membership checks. Verify with auth/security tests.                                                           |
| NFR-SEC-02   | P0       | Implemented | Require exact configured Origin for state-changing requests; validate DTOs and reject unknown JSON fields; avoid leaking internal error details.                                                    |
| NFR-SEC-03   | P0       | Implemented | Apply Helmet, no-store response headers and in-memory rate limiting as starter controls.                                                                                                            |
| NFR-SEC-04   | P1       | Planned     | Prior to production: HTTPS, full CSP, refresh/revocation, distributed abuse limits, secret rotation and security review.                                                                            |
| NFR-PRIV-01  | P0       | Implemented | Public job responses exclude private data; candidate, recruiter and analysis resources enforce ownership and tenant access.                                                                         |
| NFR-PRIV-02  | P1       | Planned     | Real resume and AI processing require explicit consent, secure storage/transmission, retention limits, access logging and deletion policies.                                                        |
| NFR-PERF-01  | P1       | Target      | Under a representative agreed workload, p95 ordinary API reads should finish within 500 ms and p95 ordinary writes within 1 s (excluding external AI). Verify through load tests; not yet measured. |
| NFR-SCALE-01 | P1       | Target      | Establish a supported concurrent-user profile with documented infrastructure and a repeatable stress test rather than claiming an untested capacity.                                                |
| NFR-AVAIL-01 | P2       | Target      | Define production uptime SLO, alerting, RPO and RTO after infrastructure selection.                                                                                                                 |
| NFR-UX-01    | P0       | Implemented | Main pages provide loading, empty, error and success states; failures visibly surface to users.                                                                                                     |
| NFR-UX-02    | P1       | Planned     | Test primary journeys for keyboard use and WCAG 2.2 AA accessibility requirements.                                                                                                                  |
| NFR-RESP-01  | P0       | Implemented | Core pages are responsive and browser tests include mobile-width behavior.                                                                                                                          |
| NFR-MAINT-01 | P0       | Implemented | Maintain feature-grouped frontend and modular NestJS API with DTOs/services, shared contracts and consistent typing.                                                                                |
| NFR-QUAL-01  | P0       | Implemented | Project includes ESLint, Prettier, TypeScript checks, Jest, Playwright, Prisma validation, build tasks and GitHub Actions configuration.                                                            |
| NFR-OPS-01   | P0       | Implemented | Developer workflow supports pnpm monorepo, Docker PostgreSQL, migrations, synthetic seed and documented local env configuration.                                                                    |
| NFR-OPS-02   | P2       | Planned     | Production adds logging, metrics, monitoring, managed backups, recovery drills, deployment and rollback procedures.                                                                                 |

## 8. Technology and architectural constraints

| Layer         | Existing choice                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Frontend      | Next.js 16 App Router, React, TypeScript, Tailwind and component primitives                       |
| Backend       | NestJS 12 REST modular monolith, services, DTO validation, Swagger                                |
| Database      | PostgreSQL 17, Prisma 7 migrations and driver adapter                                             |
| AI            | Injectable provider interface with local synthetic mock provider                                  |
| Tooling       | pnpm 10 monorepo, Docker Compose, Jest, Playwright, ESLint, Prettier, GitHub Actions              |
| Local runtime | README uses Node.js 24 LTS; package engine allows Node >=22.12.0 (align policy before production) |

Architecture flow: Browser → Next.js → same-origin /api proxy → NestJS controllers/guards/services → Prisma → PostgreSQL. AI services use a separate provider boundary. Preserve controller → service → data access separation and avoid direct database access from browser code.

Docker Compose currently runs only PostgreSQL; complete web/API containerization, reverse-proxy HTTPS, monitoring and public deployment remain planned.

## 9. Access-control matrix (current starter)

| Action                                | Visitor         | Candidate       | OWNER / RECRUITER        | ADMIN without tenant membership |
| ------------------------------------- | --------------- | --------------- | ------------------------ | ------------------------------- |
| Browse published jobs                 | Yes             | Yes             | Yes                      | Public only                     |
| Access own profile                    | No              | Own             | Own                      | Own                             |
| Apply to published jobs               | No              | Yes             | Only if also a candidate | No special bypass               |
| See candidate application history     | No              | Own             | Only if also a candidate | No special bypass               |
| Manage jobs                           | No              | No              | Own organization         | No special bypass               |
| Review/change application status      | No              | No              | Own organization         | No special bypass               |
| View organization dashboard           | No              | No              | Own organization         | No special bypass               |
| Request mock AI analysis              | No              | No              | Own organization         | No special bypass               |
| Manage invitations/interviews/billing | Not implemented | Not implemented | Planned                  | Planned                         |

One user can have multiple memberships. The operation's permissions must be evaluated against the actual organization relationship; a platform ADMIN value alone does not grant private tenant access.

## 10. API contract requirements

**Current routes** (prefix `/api`):

- **Auth:** POST `/auth/register`, POST `/auth/login`, POST `/auth/logout`, GET `/auth/me`.
- **Organizations:** GET `/organizations`, GET `/organizations/:organizationId/overview`, GET `/organizations/:organizationId/jobs`, GET `/organizations/:organizationId/applications`.
- **Jobs:** GET `/jobs`, GET `/jobs/:id`, POST `/jobs`, PATCH `/jobs/:id`, DELETE `/jobs/:id`.
- **Applications:** POST `/jobs/:jobId/applications`, GET `/applications/me`, PATCH `/applications/:id/status`.
- **AI demonstration:** POST `/ai/resume-analysis` accepts an application ID; rejects arbitrary resume text.
- **Health:** GET `/health`.

**Validation:** UUID route parameters, JSON DTO validation, page default 1, limit default 20, maximum 100, stable ordering. Current list responses are **arrays** rather than paginated envelopes; avoid changing contracts without coordinated frontend/backend updates. Appropriate error codes include 400, 401, 403, 404, 409 and 429. See [docs/api-spec.md](docs/api-spec.md) for payload details.

## 11. Acceptance test scenarios

| ID    | Priority | Scenario                                            | Expected result                                                            |
| ----- | -------- | --------------------------------------------------- | -------------------------------------------------------------------------- |
| AC-01 | P0       | Visitor opens job board                             | Only published jobs are shown; private fields do not appear.               |
| AC-02 | P0       | Candidate registers, then logs in                   | Safe identity and HttpOnly session; no plain hash/JWT in JSON.             |
| AC-03 | P0       | Authorized recruiter publishes job                  | Job appears publicly and in their organization's list.                     |
| AC-04 | P0       | Candidate applies                                   | One APPLIED record is created and visible in own history.                  |
| AC-05 | P0       | Same candidate retries                              | Duplicate application is rejected; only one row exists.                    |
| AC-06 | P0       | Recruiter A accesses organization B                 | Unauthorized read/write is denied with no data exposure.                   |
| AC-07 | P0       | Recruiter advances APPLIED → SCREENING              | New status persists and counts/history reflect it.                         |
| AC-08 | P0       | Recruiter tries invalid/concurrent transition       | Update fails and accepted stage remains consistent.                        |
| AC-09 | P0       | Authorized recruiter requests mock AI               | Labeled demonstration is persisted privately; status is unchanged.         |
| AC-10 | P0       | Unauthenticated visitor opens protected page        | Redirect/login state is shown without private records.                     |
| AC-11 | P0       | Recruiter deletes job with applications             | Conflict; history is preserved.                                            |
| AC-12 | P1       | Candidate uploads resume after feature release      | File validation, private storage and owner/reviewer-only access pass.      |
| AC-13 | P1       | Recruiter schedules interview after feature release | Only authorized application used; permitted users see schedule.            |
| AC-14 | P1       | Real AI enabled after consent gate                  | Consent/provenance enforced; human final decision and no stage automation. |

### 11.1 Mandatory negative tests

- Candidate A cannot read candidate B's applications.
- Recruiter in organization A cannot access any private records or overview for organization B using guessed IDs.
- Public job details never include resumes, applicants, private analyses or memberships.
- Database uniqueness rejects concurrent duplicate applications.
- Stage guards reject illegal/competing transitions.
- Platform ADMIN without an actual membership cannot bypass tenant authorization.
- Mock AI neither reads actual resume content nor invokes external providers.

## 12. Definition of Done (DoD)

A requirement is marked done only when:

1. Its acceptance rules and authorization constraints work as specified.
2. DTOs, errors, loading, empty and success states are covered as applicable.
3. Relevant unit, integration and/or browser tests are implemented and pass.
4. Private resources have explicit ownership/cross-tenant negative tests.
5. Prisma migrations and API/frontend/shared contracts remain synchronized.
6. Documentation and implementation status are updated without claiming unbuilt features.
7. Lint, formatting, typecheck, tests and build pass in the intended environment.
8. Any AI change is clearly synthetic **or** clears consent, privacy and human-review gates.
9. No demo secrets, actual resumes or private credentials are committed.
10. Deferred production/security work is plainly labeled.

## 13. Roadmap and traceability

| Phase                                 | Scope                                                       | Requirement IDs                                                   |
| ------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| 1 — Foundation (implemented)          | Monorepo, database, auth, tenancy and tooling               | FR-AUTH-01–05, FR-ORG-01–03, DR-01–06, starter NFRs               |
| 2 — Recruitment starter (implemented) | Jobs, applications, dashboard, synthetic AI                 | FR-JOB-01–06, FR-APP-01–06, FR-DASH-01–03, FR-AI-01–04, AC-01–11  |
| 2 extension (planned)                 | Invitations, profiles, resumes, search, audits, interviews  | FR-ORG-05–06, FR-JOB-07, FR-APP-07–08, FR-RES-01–03, FR-INT-01–02 |
| 3 — Real AI privacy gate (planned)    | Consent, parsing, traceable model integration and review    | FR-AI-05–06, DR-07–08, NFR-PRIV-02, AC-14                         |
| 4 — SaaS production (future)          | Admin, plans, security hardening, operations and deployment | FR-ORG-07, FR-SAAS-01–02, NFR-SEC-04, NFR-OPS-02                  |

**Change control:** assign new IDs to new scope; update statuses only when implementation and acceptance tests exist. The task tracker and [docs/roadmap.md](docs/roadmap.md) should remain aligned.

## 14. Risks and open decisions

| Risk / decision                         | Action needed                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| Seed-only membership setup              | Implement safe creation/invitation workflow before self-service launch.                      |
| JWT token copy possible until expiry    | Add refresh-session revocation and logout-all before production.                             |
| Application-level-only tenant isolation | Secure direct DB credentials and consider additional defense in depth.                       |
| Synthetic AI misunderstood              | Keep the UI, response and docs visibly labeled as mock demonstration.                        |
| Resume data sensitivity                 | Decide file types/limits, scanning, storage, retention, deletion and legal/privacy review.   |
| Real AI provider                        | Decide consent language, data processing terms, provenance, cost/time limits and evaluation. |
| Scheduling                              | Define timezone model, notifications and feedback visibility.                                |
| Capacity / reliability                  | Establish tested workload, SLO, monitoring, RPO/RTO and incident response.                   |
| Runtime version discrepancy             | Reconcile Node 24 LTS guidance with `package.json` engine range.                             |

## 15. Source references

- [README.md](README.md) — actual starter features and development workflow.
- [docs/architecture.md](docs/architecture.md) — boundaries, guard model, security decisions.
- [docs/api-spec.md](docs/api-spec.md) — routes, input/output and stage transitions.
- [docs/database.md](docs/database.md) — entities and data integrity.
- [docs/roadmap.md](docs/roadmap.md) — phases and postponed capabilities.
- [apps/api/prisma/schema.prisma](apps/api/prisma/schema.prisma) — current schema source of truth.

---

**Maintenance note:** Requirements baseline as of 2026-11-06. An implementation status describes the repository documentation and should be independently verified in running tests. Performance, scalability and reliability targets are goals, not current certifications.
