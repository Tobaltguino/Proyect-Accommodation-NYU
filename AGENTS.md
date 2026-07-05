# AGENTS.md
Operational guide for coding agents in this repository.
## 1) Scope
- Monorepo with two TypeScript apps:
  - `backend/`: NestJS API (Jest unit + e2e)
  - `frontend/`: Angular app (Angular CLI tests, Vitest globals)
- Keep changes minimal and aligned with existing patterns.
- Do not add new frameworks/architectures unless explicitly requested.
## 2) Repository Layout
- Root contains `.git/`, `backend/`, `frontend/`.
- Backend key config files:
  - `backend/package.json`
  - `backend/eslint.config.mjs`
  - `backend/.prettierrc`
  - `backend/tsconfig.json`
  - `backend/test/jest-e2e.json`
- Frontend key config files:
  - `frontend/package.json`
  - `frontend/angular.json`
  - `frontend/.editorconfig`
  - `frontend/tsconfig.json`
  - `frontend/tsconfig.app.json`
  - `frontend/tsconfig.spec.json`
## 3) Cursor / Copilot Rules Status
- Checked `.cursorrules`: not found.
- Checked `.cursor/rules/`: not found.
- Checked `.github/copilot-instructions.md`: not found.
- Follow this file plus project configs (`eslint`, `prettier`, `tsconfig`, `editorconfig`).
## 4) Setup
- Run commands from each project directory (not monorepo root).
- Backend:
  - `cd backend`
  - `npm install`
- Frontend:
  - `cd frontend`
  - `npm install`
## 5) Build / Lint / Test Commands
- Backend (`backend/`):
  - Build: `npm run build`
  - Lint: `npm run lint` (includes `--fix`)
  - Format: `npm run format`
  - Dev server: `npm run start:dev`
  - Start once: `npm run start`
  - Production run: `npm run start:prod`
  - Unit tests: `npm run test`
  - Unit watch: `npm run test:watch`
  - Coverage: `npm run test:cov`
  - E2E tests: `npm run test:e2e`
- Frontend (`frontend/`):
  - Build: `npm run build`
  - Dev server: `npm run start`
  - Unit tests: `npm run test`
  - Watch build: `npm run watch`
  - Lint: no dedicated lint script in `frontend/package.json`
  - Do not introduce alternate lint tooling unless requested
## 6) Single-Test Commands (Important)
- Backend: single unit test file:
  - `npm run test -- src/app.controller.spec.ts`
  - `npm run test -- app.controller.spec.ts`
- Backend: single unit test by name:
  - `npm run test -- -t "should return \"Hello World!\""`
- Backend: single e2e file:
  - `npm run test:e2e -- test/app.e2e-spec.ts`
- Backend: single e2e test by name:
  - `npm run test:e2e -- -t "\/ \(GET\)"`
- Frontend: single spec file:
  - `npm run test -- --include="src/app/app.spec.ts" --watch=false`
- Frontend: single test by name pattern:
  - `npm run test -- --testNamePattern="should create the app" --watch=false`
- If flags differ across Angular minor versions, use nearest equivalent.
## 7) Formatting and Style
- Global:
  - Prefer TypeScript for source code.
  - Keep diffs small; avoid pure reformat-only changes.
  - Preserve existing quote and trailing-comma style.
  - Keep logic readable; avoid dense one-liners.
- Backend sources of truth:
  - `backend/.prettierrc`: `singleQuote: true`, `trailingComma: all`
  - `backend/eslint.config.mjs`: type-aware TypeScript + Prettier integration
  - Current notable rules:
    - `@typescript-eslint/no-explicit-any`: off (still avoid `any` when possible)
    - `@typescript-eslint/no-floating-promises`: warn
    - `@typescript-eslint/no-unsafe-argument`: warn
- Frontend sources of truth:
  - `frontend/.editorconfig`: UTF-8, 2-space indent, trim trailing whitespace
  - `frontend/package.json` Prettier: `printWidth: 100`, `singleQuote: true`
  - HTML formatting parser: `angular`
## 8) Imports and Modules
- Keep imports at the top of each file.
- Order imports as:
  1) framework/library
  2) internal aliases (if present)
  3) relative imports
- Remove unused imports.
- Keep specifiers explicit and minimal.
- In NestJS, keep provider/controller/module wiring in module files.
## 9) Types and Strictness
- Backend TypeScript is strict (`strict: true`, `strictNullChecks: true`).
- Frontend TypeScript and Angular templates are strict.
- Type function parameters/returns when non-trivial.
- Prefer `unknown` over `any` for external input, then narrow.
- Use DTOs/interfaces/types for API contracts instead of loose objects.
## 10) Naming Conventions
- Classes: `PascalCase`.
- Functions/variables/methods: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` only for true constants.
- Backend file patterns:
  - `*.controller.ts`
  - `*.service.ts`
  - `*.module.ts`
  - `*.spec.ts`
- Frontend naming:
  - Use Angular defaults (kebab-case file names where applicable)
  - Tests as `*.spec.ts`
- Test names should describe behavior, not implementation details.
## 11) Error Handling
- Never swallow errors silently.
- Backend:
  - Throw meaningful HTTP exceptions where applicable.
  - Validate config/env values before use.
  - Await async operations; use try/catch when translating or recovering.
- Frontend:
  - Handle Observable/Promise errors in UI-facing flows.
  - Keep user-facing error states explicit.
## 12) Testing Expectations
- Add/update tests when behavior changes.
- Test locations:
  - Backend unit: `backend/src/**/*.spec.ts`
  - Backend e2e: `backend/test/*.e2e-spec.ts`
  - Frontend unit: `frontend/src/**/*.spec.ts`
- Prefer deterministic tests (no real network and no timing flakiness).
- Use focused test runs while iterating, then broader relevant suites.
## 13) Agent Workflow
- Before coding:
  - Read nearby files and follow existing conventions.
  - Confirm whether change is backend, frontend, or both.
- During coding:
  - Keep scope tight.
  - Update tests/docs when behavior changes.
- Before finishing:
  - Run relevant build/test commands.
  - Run backend lint/format when backend code changed.
  - Report any skipped verification explicitly.
## 14) Do / Don’t
- Do:
  - Follow NestJS and Angular idioms already used in this repo.
  - Preserve compatibility with current toolchain versions.
- Don’t:
  - Commit secrets/credentials.
  - Add unrelated refactors.
  - Change package manager or lockfile strategy unless requested.

This file is the default operating contract for coding agents in this repository.
