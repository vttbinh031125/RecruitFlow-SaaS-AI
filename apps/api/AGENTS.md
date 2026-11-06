# Backend (`@recruitflow/api`) instructions

Follow the root `AGENTS.md` alongside these backend-specific conventions.

## Prisma 7 and database access

- `prisma/schema.prisma` uses the Prisma 7 `prisma-client` generator outputting CommonJS modules to `src/generated/prisma` (`moduleFormat = "cjs"`). Do not add `url = env("DATABASE_URL")` to `datasource db` in `schema.prisma`; the connection URL is configured in `prisma.config.ts`.
- Import Prisma client classes, enums, and types from `src/generated/prisma/client` or `src/generated/prisma/enums` (never from `@prisma/client`).
- `PrismaService` (`src/prisma/prisma.service.ts`) instantiates `PrismaClient` with `@prisma/adapter-pg` (`PrismaPg`). Inject it in NestJS services. Standalone seed/test clients must disconnect when finished.
- After editing `prisma/schema.prisma`, run `pnpm --filter @recruitflow/api exec prisma validate` and `pnpm db:generate` before running `pnpm typecheck` or `pnpm build`.

## NestJS modules, validation, and security

- Keep controllers, DTOs, and services scoped to their domain module under `src/modules/`. Register new modules in `src/app.module.ts`.
- Validate all request bodies and query parameters with `class-validator` / `class-transformer` DTOs. The global `ValidationPipe` enforces `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true`.
- Every non-`GET`/`HEAD`/`OPTIONS` request requires `Origin: <env.WEB_ORIGIN>` (`src/main.ts`). Integration tests (`test/recruitment.integration.test.ts`) use a shared `request()` helper that sets this header. Manual `fetch` checks for `POST`, `PATCH`, `PUT`, or `DELETE` must include it in `headers` too.
- Enforce tenant isolation in services using the resource's database relationship (for example `application -> job -> organizationId` via `OrganizationsService.requireRecruiter` or an in-transaction `organizationMember` lookup). Never trust a client-supplied `organizationId` or `userId` without verifying membership.
- Use `this.db.$transaction(...)` with optimistic status checks when mutating recruitment pipeline state or multi-table records.

## Build and runtime behavior

- `pnpm --filter @recruitflow/api dev` compiles TypeScript and runs `node dist/main.js` (not watch mode). Integration tests spawn the compiled API. Run `pnpm --filter @recruitflow/api build` (or restart `pnpm dev`) after backend TypeScript changes before integration tests or manual API checks.
