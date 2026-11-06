---
name: db-and-tests
description: >-
  Runbook for validating Prisma 7 schema changes, generating the client, and running
  RecruitFlow database integration tests (recruitflow_test) or Playwright E2E tests
  (recruitflow_e2e_test) safely on Windows PowerShell without polluting the main database.
---

# Database & Test Verification Runbook

Follow this skill whenever modifying `apps/api/prisma/schema.prisma`, adding backend endpoints, or running database integration / browser E2E verification.

## 1. Safety Rules (from root `AGENTS.md`)

- **Never** reset a database (`prisma migrate reset`), drop tables, delete Docker volumes, or overwrite non-test data without explicit user approval.
- Integration tests must run against a dedicated database ending in `_test` (`recruitflow_test`).
- Browser E2E tests must run against a separate seeded database (`recruitflow_e2e_test`).
- Always clear temporary `$env:DATABASE_URL` overrides in PowerShell after running migration or test commands so subsequent commands do not target the wrong database.

## 2. Prisma Schema & Client Workflow

After editing `apps/api/prisma/schema.prisma`:

1. Validate the schema and generate the Prisma 7 client into `apps/api/src/generated/prisma`:
   ```powershell
   pnpm --filter @recruitflow/api exec prisma validate
   pnpm db:generate
   ```
2. Apply committed additive migrations on the development database (requires PostgreSQL container running via `pnpm db:up`). `db:migrate` runs `migrate deploy`; it does not generate a migration from schema edits. Generate and review new migration SQL separately, and never approve a reset prompt:
   ```powershell
   pnpm db:migrate
   ```

## 3. Standard Quality Checks (Always Run After Code Changes)

```powershell
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

## 4. Database Integration Tests (`recruitflow_test`)

Integration tests (`apps/api/test/recruitment.integration.test.ts`) require `TEST_DATABASE_URL` ending in `_test` and a fresh `@recruitflow/api` build:

```powershell
# 1. Ensure PostgreSQL is running and recruitflow_test exists (ignore error if already created)
pnpm db:up
docker compose exec postgres createdb -U recruitflow recruitflow_test

# 2. Apply migrations to recruitflow_test and immediately remove the DATABASE_URL override
$env:TEST_DATABASE_URL='postgresql://recruitflow:recruitflow_local@127.0.0.1:5433/recruitflow_test'
$env:DATABASE_URL=$env:TEST_DATABASE_URL
pnpm db:migrate
Remove-Item Env:DATABASE_URL

# 3. Build the API and run integration tests
pnpm --filter @recruitflow/api build
pnpm test:integration
```

When adding state-changing requests (`POST`, `PATCH`, `DELETE`) in `recruitment.integration.test.ts`, use its existing `request()` helper, which sends the configured Origin header. Manual `fetch` calls must supply `headers: { Origin: webOrigin }` to satisfy the origin middleware in `apps/api/src/main.ts`.

## 5. Browser E2E Tests (`recruitflow_e2e_test`)

Only run when ports `3000` and `5173` are free (do not stop unrelated user processes):

```powershell
docker compose exec postgres createdb -U recruitflow recruitflow_e2e_test
$env:DATABASE_URL='postgresql://recruitflow:recruitflow_local@127.0.0.1:5433/recruitflow_e2e_test'
pnpm db:migrate
pnpm db:seed
pnpm build
```

Start the built app with `DATABASE_URL` pointed at `recruitflow_e2e_test`, run `pnpm test:e2e`, then stop the app process and run `Remove-Item Env:DATABASE_URL`.
