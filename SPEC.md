# RecruitFlow SaaS — Specification
## Goal
Multi-tenant applicant tracking platform for SMEs. Company workspaces, job postings, candidate applications, interview pipeline, reporting, Free/Pro quotas, and optional AI-assisted workflows.

## Stack
Frontend React, Vite, TypeScript, Tailwind, TanStack Query.
Backend NestJS REST, TypeScript, Prisma, PostgreSQL.
Auth Google OpenID Connect, short-lived JWT access, rotating refresh token.
Infrastructure Docker Compose, GitHub Actions, Swagger, Jest/Vitest, Playwright.
Private CV files in S3-compatible object storage (development adapter allowed).

## Roles
Organization Owner: workspace, members, plans.
Recruiter: jobs, applications, interviews, analytics.
Interviewer: assigned interviews and evaluations only.
Candidate: own profile, CV and applications.
A user can belong to multiple organizations; roles are per-organization.

## Core modules
1. Auth: OIDC login, refresh rotation, logout, sessions.
2. Organizations: create workspace, invite members, RBAC.
3. Jobs: create, publish, archive, public listings.
4. Applications: apply once per job, upload private CV, status history.
5. Pipeline: Applied -> Screening -> Interview -> Offer -> Hired/Rejected; transactional updates.
6. Interviews: schedule, assign interviewer, evaluation, avoid conflicts.
7. Analytics: organization-scoped counts and funnel.
8. Plans: Free/Pro feature limits and usage tracking; no real payments in MVP.
9. AI: editable job description draft, human-reviewed CV extraction. Use synthetic data for testing; obtain appropriate consent before external processing.

## PostgreSQL tables
users, auth_identities, refresh_sessions, organizations, organization_members, invitations, plans, subscriptions, jobs, candidate_profiles, file_assets, applications, application_events, interviews, interview_evaluations, audit_logs, ai_usage_logs.
Use UUID PKs, timestamps, foreign keys, indexes and unique constraints (organization_id,user_id) and (job_id,candidate_user_id). Tenant isolation must be enforced in every query and authorization check.

## API draft
GET /health
GET /me
POST /auth/refresh
POST /auth/logout
GET/POST /organizations
POST /organizations/:orgId/invitations
GET/POST /organizations/:orgId/jobs
GET /jobs/public
POST /jobs/public/:jobId/applications
GET /me/applications
GET /organizations/:orgId/applications
PATCH /organizations/:orgId/applications/:id/stage
GET/POST /organizations/:orgId/interviews
POST /organizations/:orgId/interviews/:id/evaluations
GET /organizations/:orgId/analytics
POST /organizations/:orgId/ai/job-description
POST /organizations/:orgId/ai/parse-resume

## Acceptance tests
Two companies can register; recruiter A publishes job; candidate applies and uploads CV; A advances stage and assigns interview; interviewer evaluates; recruiter B cannot read or modify company A resources even using known IDs; AI produces editable draft and reviewable parsed CV; Docker starts app; CI checks pass.

## Nonfunctional
Input validation, rate limits, secure file upload, private download, audit logging, structured logs without PII, database transactions, pagination, accessible responsive UI, Swagger, CI/CD. No microservices, Kubernetes, payment processing, or automated candidate rejection in MVP.
