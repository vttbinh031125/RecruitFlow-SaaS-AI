<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## RecruitFlow frontend (`@recruitflow/web`) instructions

Follow the root `AGENTS.md` alongside these frontend conventions:

- **Same-origin API client (`src/lib/api.ts`)**: All browser requests go through `/api/*` (rewritten to `API_TARGET` in `next.config.ts`) with `credentials: 'same-origin'` and `cache: 'no-store'`. Never read or store JWTs in `localStorage` or client JavaScript.
- **Multipart uploads (`FormData`)**: `api()` currently defaults to `'Content-Type': 'application/json'`. When adding file upload endpoints (such as resume upload), omit `'Content-Type'` when `init?.body instanceof FormData` so the browser sets the `multipart/form-data` boundary automatically.
- **Workspace & remote state**: Use `useWorkspace()` (`src/features/dashboard/workspace.tsx`) for the authenticated user and active organization. Frontend visibility never replaces server authorization. Use `useRemote()` (`src/hooks/use-remote.ts`) for loading/error states and ignoring stale results; it does not abort network requests.
- **Contracts**: Keep frontend response types in `src/types/recruitment.ts` (and shared cross-workspace contracts in `@recruitflow/shared`) synchronized with backend `select` projections and DTOs.
