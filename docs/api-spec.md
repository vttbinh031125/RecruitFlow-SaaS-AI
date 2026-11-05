# Recruitment API

All routes start with `/api`. Authentication uses the `access_token` HttpOnly cookie. State-changing requests must send `Origin: http://localhost:5173` (or the configured WEB_ORIGIN). JSON bodies reject unknown properties.

| Method | Route                                       | Access                                                          |
| ------ | ------------------------------------------- | --------------------------------------------------------------- |
| GET    | /health                                     | Public; API process availability                                |
| POST   | /auth/register                              | Public; candidate account, fullName/email/password              |
| POST   | /auth/login                                 | Public; email/password; sets cookie                             |
| POST   | /auth/logout                                | Clears cookie; 204                                              |
| GET    | /auth/me                                    | Authenticated; safe user profile                                |
| GET    | /organizations                              | Authenticated; own memberships only                             |
| GET    | /jobs                                       | Public; published jobs only                                     |
| GET    | /jobs/:id                                   | Public; published job only                                      |
| GET    | /organizations/:organizationId/jobs         | Organization owner/recruiter; includes drafts                   |
| POST   | /jobs                                       | Organization owner/recruiter                                    |
| PATCH  | /jobs/:id                                   | Job organization's owner/recruiter                              |
| DELETE | /jobs/:id                                   | Job organization's owner/recruiter; 409 when applications exist |
| POST   | /jobs/:jobId/applications                   | Authenticated candidate; published job; unique candidate/job    |
| GET    | /applications/me                            | Candidate's own applications                                    |
| GET    | /organizations/:organizationId/applications | Organization owner/recruiter                                    |
| PATCH  | /applications/:id/status                    | Application job organization's owner/recruiter                  |

List queries: `?page=1&limit=20`, maximum limit 100. Results are arrays with stable date/id ordering. UUID route parameters are validated.

Create job example:

```json
{
  "organizationId": "<organization UUID>",
  "title": "Frontend Developer",
  "description": "Build accessible interfaces with our team.",
  "requirements": "React and TypeScript",
  "location": "Remote",
  "employmentType": "FULL_TIME",
  "status": "PUBLISHED"
}
```

Registration/login example (use synthetic credentials locally):

```json
{
  "email": "candidate@example.test",
  "password": "ExamplePassword123!",
  "fullName": "Example Candidate"
}
```

Login accepts email/password only and returns id, email, fullName, platformRole; the token is never in the response body. Registration does not log in automatically. Passwords require 12-72 characters and at most 72 UTF-8 bytes.

Stage update: `{"status":"SCREENING"}`. Allowed transitions: APPLIED ? SCREENING ? INTERVIEW ? OFFER ? HIRED; REJECTED is allowed from any nonterminal stage. HIRED and REJECTED are terminal. Updates use a transaction and compare the previous stage to detect competing changes.

Status codes: 200 reads/updates/login, 201 registration/creation, 204 logout, 400 validation/transition, 401 unauthenticated, 403 forbidden membership/origin, 404 missing or unpublished resource, 409 duplicate/reference/concurrent-update conflict, 429 rate limit.

Example error: `{"statusCode":409,"error":"Record already exists"}`. HTTP validation errors may have a structured object in `error` with a `message` array. Unexpected errors return a generic 500.

Resume, interview and administrative endpoints are pending. Public job endpoints never include applications, candidate profiles or resumes.

## Overview and mock AI

`GET /api/organizations/:organizationId/overview` requires organization membership and returns real counts: `{ "jobs": 3, "publishedJobs": 3, "applications": 3, "stages": [{ "status": "APPLIED", "count": 3 }] }`. All controlled stages are included, including zero counts. These numbers are an illustrative payload, not claimed runtime metrics.

`POST /api/ai/resume-analysis` accepts `{ "applicationId": "<UUID>" }`. Only the application's organization owner/recruiter is authorized. It returns an analysis id/time and `{ "demonstration": true, "provider": "mock", "summary": "DEMONSTRATION ONLY: ...", "matchedSkills": ["Example: TypeScript"], "missingSkills": ["Example: PostgreSQL experience requires human review"] }`. No resume is read and no hiring stage changes. Results are private demonstration records; arbitrary resume text and extra body fields are rejected.

Application lists also return `allowedNextStatuses`, derived from backend transition rules, so review controls use the server's available stages.
