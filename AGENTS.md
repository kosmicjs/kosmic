# AGENTS.md - Guidelines for AI Coding Agents

## Purpose

Concise operating guide for agents in this TypeScript + ESM monorepo.

## Stack & Repo Shape

- npm workspaces monorepo
- Pure ESM (no CommonJS)
- Node.js >=22
- TypeScript project references
- XO + Prettier integration
- Node native test runner
- Husky + lint-staged
- Changesets for versioning/publishing
- Main folders: `packages/*`, `apps/*`, `.changeset/`, `.github/`, `.husky/`

## REQUIRED After Any Code Change

Run these from repo root, in this order:

1. `npm run lint -- --fix`
2. `npm run build`
3. `npm run lint`

If a command fails, fix the issue and rerun until all pass.

## Day-to-Day Commands

- Build all: `npm run build`
- Type-check: `npm run check`
- Lint: `npm run lint`
- Test all: `npm test`
- Coverage: `npm run test:coverage`
- Package-specific command: `npm run <script> -w @kosmic/<pkg>`

## TypeScript & Import Rules

- Always include `.ts` in local TS imports.
- Use full package imports across workspaces (e.g. `@kosmic/utils`).
- Use `import type` for type-only imports.
- No enums/namespaces; prefer erasable TS syntax.
- `noUncheckedIndexedAccess` is on: guard possible `undefined`.
- Keep strict typing; avoid `any`.

## Package & Dependency Rules

- Package names use `@kosmic/<name>` and lowercase-hyphen style.
- Use `workspace:*` for inter-package dependencies.
- When adding a workspace dependency:
  - update `dependencies` in `package.json`
  - update `references` in package `tsconfig.json`
  - ensure root `tsconfig.json` references the package when needed

## Testing Guidelines

- Use Node’s native test runner (`node:test`) + `node:assert`.
- Keep tests in each package’s `test/` directory.
- Favor deterministic tests and clean mock state.

## Commit & PR Rules

- Conventional Commits are required.
- Preferred types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, etc.
- Scope should be package-focused when useful (e.g. `fix(router): ...`).
- Pre-commit hooks run formatting/lint fixes automatically; do not rely on them alone.

## Changesets & Release Flow

- For package changes, add a changeset: `npm run changeset`.
- Version packages: `npm run version`.
- Publish flow: `npm run release`.
- CI can publish through Changesets action when configured secrets exist.

## Config Files You’ll Touch Most

- `package.json` (root + packages)
- `tsconfig.json` (root + packages)
- `xo.config.ts`
- `.changeset/config.json`
- `.lintstagedrc.cjs`
- `.commitlintrc.json`

## Agent Behavior Expectations

- Make minimal, scoped changes; avoid unrelated refactors.
- Comment all new functions with proper JSDoc syntax
- Preserve ESM style and existing project conventions.
- Prefer clear comments about intent, not obvious mechanics.
- Before finishing any task, confirm the REQUIRED command trio passed.

## Quick Troubleshooting

- If module resolution fails: verify dependency, TS references, then run `npm install`.
- If build order issues appear: run root `npm run build`.
- If lint/type issues persist: run the REQUIRED command trio again after fixes.
- NEVER use workspace protocol in dependencies. Always install like @kosmic/* for internal deps. npm will take care of it.
