# AGENTS.md - Development Guidelines for AI Coding Agents

This document provides essential information for AI coding agents working in this repository.

## Project Overview

This is an opinionated TypeScript + ESM monorepo starter template for publishing Node.js packages to npm. The project uses:

- **npm workspaces** for monorepo management
- **Pure ESM** (ECMAScript Modules) - no CommonJS
- **Node.js >=22** with native TypeScript type stripping
- **XO** for linting with Prettier formatting
- **Node.js native test runner** for testing
- **Conventional Commits** with Commitlint
- **Husky + lint-staged** for pre-commit hooks
- **Changesets** for versioning and publishing
- **TypeScript project references** for efficient builds

## Monorepo Structure

```
spence-s-monorepo-template/
├── .changeset/           # Changesets configuration and changesets
├── .github/              # CI/CD workflows
├── .husky/               # Git hooks
├── packages/             # All publishable packages
│   ├── utils/            # @kosmic/utils - Utility functions
│   │   ├── src/
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── core/             # @kosmic/server - Core functionality
│       ├── src/
│       ├── test/
│       ├── package.json
│       └── tsconfig.json
├── package.json          # Root package (private, defines workspaces)
├── tsconfig.json         # Root TypeScript config (solution file)
├── tsconfig.build.json   # Reference build config for packages
└── xo.config.ts          # Shared linting configuration
```

## Build, Test & Lint Commands

### Building

- `npm run build` - Build all workspace packages
- `npm run build -w @kosmic/utils` - Build specific package
- `npm run check` - Type-check all packages without building

### Testing

- `npm test` - Run all tests across all packages
- `npm run test:coverage` - Run tests with coverage for all packages
- `npm test -w @kosmic/server` - Run tests for specific package

#### Running a Single Test File

```bash
# Run a specific test file in a package
node --test packages/utils/test/index.test.ts

# Run with watch mode
node --test --watch packages/utils/test/index.test.ts
```

### Linting & Formatting

- `npm run lint` - Run XO linter and type checker on all packages
- XO is configured with Prettier integration (auto-formats on fix)
- Pre-commit hooks auto-fix linting issues via lint-staged

### Workspace Management

```bash
# Install dependency to specific package
npm install lodash -w @kosmic/server

# Install workspace dependency (edit package.json first)
# Add "@kosmic/utils": "workspace:*" to dependencies
npm install

# Run script in all workspaces
npm run build --workspaces --if-present

# Run script in specific workspace
npm run test -w @kosmic/utils
```

### Publishing with Changesets

- `npm run changeset` - Create a changeset (describe changes)
- `npm run version` - Apply changesets and bump versions
- `npm run release` - Build and publish to npm

### Other Commands

- `npm run update` - Interactive dependency updates (ncu -i)

## Working with Packages

### Adding a New Package

1. **Create directory structure:**

   ```bash
   mkdir -p packages/my-package/src packages/my-package/test
   ```

2. **Create package.json:**

   ```json
   {
     "name": "@kosmic/my-package",
     "version": "0.0.0",
     "description": "Description of my package",
     "type": "module",
     "exports": {
       ".": {
         "import": {
           "types": "./dist/index.d.ts",
           "default": "./dist/index.js"
         }
       }
     },
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "files": ["dist"],
     "scripts": {
       "build": "rimraf dist && tsc -p tsconfig.json",
       "check": "tsc --noEmit",
       "lint": "xo",
       "test": "node --test",
       "test:coverage": "node --test --experimental-test-coverage"
     },
     "keywords": ["my-package"],
     "author": {
       "name": "Spencer Snyder",
       "email": "sasnyde2@gmail.com",
       "url": "https://spencersnyder.io"
     },
     "license": "MIT",
     "engines": {
       "node": ">=22"
     }
   }
   ```

3. **Create tsconfig.json:**

   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "composite": true,
       "rootDir": "src",
       "outDir": "dist"
     },
     "include": ["src"],
     "exclude": ["node_modules", "dist", "test"],
     "references": [{ "path": "../utils" }]
   }
   ```

4. **Add package reference to root tsconfig.json:**

   ```json
   {
     "files": [],
     "references": [
       {"path": "./packages/utils"},
       {"path": "./packages/core"},
       {"path": "./packages/my-package"}
     ],
     ...
   }
   ```

5. **Run `npm install` to link the workspace**

### Inter-package Dependencies

To use one workspace package in another:

1. **Add to package.json dependencies:**

   ```json
   {
     "dependencies": {
       "@kosmic/utils": "workspace:*"
     }
   }
   ```

2. **Add TypeScript reference in tsconfig.json:**

   ```json
   {
     "references": [{ "path": "../utils" }]
   }
   ```

3. **Import in your code:**
   ```typescript
   import { capitalize } from "@kosmic/utils";
   ```

The `workspace:*` protocol tells npm to link to the local workspace package. When published, this is automatically replaced with the actual version number.

### Package Naming Convention

- All packages use the `@kosmic/` scope
- Package names should be lowercase with hyphens
- Examples: `@kosmic/utils`, `@kosmic/server`, `@kosmic/my-feature`

## Publishing Workflow with Changesets

Changesets provide a structured way to manage versions and changelogs across the monorepo.

### Creating a Changeset

When you make changes to any package:

```bash
npm run changeset
```

This interactive CLI will:

1. Ask which packages have changed
2. Ask for the semver bump type (major, minor, patch)
3. Prompt you to write a summary of the changes

This creates a markdown file in `.changeset/` describing the changes.

### Changeset Best Practices

- **Create a changeset for every PR** that changes package code
- **Choose the right semver bump:**
  - **major**: Breaking changes (public API changes)
  - **minor**: New features (backwards compatible)
  - **patch**: Bug fixes (backwards compatible)
- **Write clear summaries** - these become changelog entries
- **One changeset per logical change** - you can create multiple changesets

### Versioning Packages

When ready to release:

```bash
npm run version
```

This will:

1. Consume all changesets
2. Update package.json versions
3. Generate CHANGELOG.md files
4. Delete consumed changeset files

Commit the version changes with:

```bash
git add .
git commit -m "chore: version packages"
```

### Publishing to npm

After versioning:

```bash
npm run release
```

This will:

1. Build all packages
2. Publish changed packages to npm
3. Create git tags for each published version

### Automated Releases (GitHub Actions)

The GitHub Actions workflow (`.github/workflows/node.js.yml`) includes a `release` job that:

1. Runs after successful build on main branch
2. Uses the `changesets/action`
3. Creates a "Version Packages" PR automatically when changesets exist
4. When that PR is merged, automatically publishes to npm

**Required secrets:**

- `NPM_TOKEN`: npm authentication token for publishing
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## Code Style Guidelines

### General Formatting

- **Indentation**: 2 spaces (enforced by .editorconfig)
- **Line endings**: LF
- **Trailing whitespace**: Remove
- **Final newline**: Required
- **Prettier**: Enabled via XO integration

### TypeScript Configuration

#### Module System

- **Pure ESM only** - `"type": "module"` in package.json
- Use `import`/`export`, never `require()`
- Module setting: `"module": "node20"` (adapts based on package.json type field)
- Target: ES2023

#### Strict Type Checking

The project uses maximum TypeScript strictness:

- `"strict": true`
- `"noUncheckedIndexedAccess": true` - Array/object access returns `T | undefined`
- `"exactOptionalPropertyTypes": true` - Distinguish between `undefined` and missing properties
- `"verbatimModuleSyntax": true` - Explicit type imports required

#### Special TypeScript Features

- **Type-only imports**: Use `import type` for types (enforced by `@typescript-eslint/no-import-type-side-effects`)
- **Erasable syntax only**: `"erasableSyntaxOnly": true` - No enums, namespaces, or non-erasable features
- **File extensions**: Always include `.ts` extensions in imports within a package (e.g., `import {foo} from './bar.ts'`)
  - This is enforced by `import-x/extensions` rule
  - TypeScript rewrites these to `.js` via `"rewriteRelativeImportExtensions": true`
- **Cross-package imports**: Use full package names (e.g., `import {foo} from '@kosmic/utils'`)

#### TypeScript Project References

This monorepo uses TypeScript project references for:

- **Faster builds**: Only rebuild changed packages
- **Better IDE support**: Go-to-definition works across packages
- **Enforced dependency graph**: TypeScript ensures build order

**Key points:**

- Root `tsconfig.json` is a solution file with `"files": []` and `"references"` array
- Each package has `"composite": true` in its tsconfig.json
- Packages reference their dependencies in `"references"` array
- Build order is automatically determined by TypeScript

### Import Style

```typescript
// ✅ Correct - Type imports with 'type' keyword
import type { SomeType } from "./types.ts";
import { someFunction } from "./utils.ts";

// ✅ Correct - Cross-package imports use full package name
import { capitalize } from "@kosmic/utils";

// ✅ Correct - Always include .ts extension for local imports
import { helloWorld } from "../src/index.ts";

// ❌ Wrong - Missing type keyword
import { SomeType } from "./types.ts";

// ❌ Wrong - Missing file extension for local import
import { someFunction } from "./utils";

// ❌ Wrong - Using .js extension in TypeScript files
import { someFunction } from "./utils.js";

// ❌ Wrong - Relative import across packages
import { capitalize } from "../utils/src/index.ts";
```

### Naming Conventions

- Use camelCase for variables, functions, and methods
- Use PascalCase for types, interfaces, and classes
- No enforced capitalized comments (disabled via xo.config.ts)
- No enforced naming-convention rule (disabled via xo.config.ts for flexibility)

### Testing Style

Use Node.js native test runner with TypeScript:

```typescript
import { test, describe } from "node:test";
import assert from "node:assert";

void describe("feature name", async () => {
  await test("test case description", (t) => {
    // Use t.mock for mocking
    const mockFn = t.mock.method(object, "method");

    // Use node:assert for assertions
    assert.equal(actual, expected);
    assert.strictEqual(actual, expected);

    // Clean up mocks
    t.mock.reset();
  });
});
```

### Test File Organization

- Test files: `packages/*/test/**/*.test.ts`
- Each package has its own `test/` directory
- Import source files with full path including `.ts` extension
- Import from other packages using full package names

### Error Handling

- Use explicit error types when possible
- Avoid `any` types (strict mode enforced)
- Handle potential `undefined` from array/object access due to `noUncheckedIndexedAccess`

### Comments

- No requirement for capitalized comments
- Focus on "why" not "what" in comments
- Prefer self-documenting code over excessive comments

## Git & Commits

### Commit Message Format

Follow Conventional Commits specification (@commitlint/config-conventional):

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

**Examples**:

- `feat(utils): add string formatting utilities`
- `fix(server): resolve memory leak in parser`
- `docs: update README with new examples`
- `test(utils): add tests for edge cases`
- `chore: update dependencies`

**Optional scope**: Use package name without scope prefix (e.g., `utils`, `server`, not `@kosmic/utils`)

### Pre-commit Hooks

Husky + lint-staged automatically runs before commits:

- Prettier on `**/*.md` files (excluding test fixtures)
- Prettier with packagejson plugin on `**/package.json`
- XO with --fix on `**/*.{js,ts}` files

This works across all packages in the monorepo.

## Key Configuration Files

- **package.json** (root): Workspace configuration, shared scripts
- **package.json** (packages): Individual package metadata, dependencies
- **tsconfig.json** (root): TypeScript solution file with project references
- **tsconfig.json** (packages): Package-specific TypeScript config extending root
- **xo.config.ts**: XO linter rules with Prettier integration (shared)
- **.editorconfig**: Formatting rules (2 spaces, LF, UTF-8)
- **.commitlintrc.json**: Conventional commits enforcement
- **.lintstagedrc.cjs**: Pre-commit hook configuration (monorepo-aware)
- **.changeset/config.json**: Changesets configuration

## Important Notes for Agents

1. **Always include file extensions** in TypeScript imports (`.ts` for local imports)
2. **Use full package names** for cross-package imports (`@kosmic/utils`)
3. **Use `import type`** for type-only imports to avoid side effects
4. **Array/object access** may return undefined - handle accordingly
5. **No enums or namespaces** - use const objects or union types instead
6. **ESM only** - never use CommonJS syntax
7. **Node.js >=22 required** - can use latest Node.js features
8. **Test files use native Node test runner** - no Jest, Mocha, etc.
9. **Pre-commit hooks will auto-fix** many linting issues
10. **Run `npm run lint`** before committing to catch type errors early
11. **Use conventional commit messages** - commitlint will reject non-compliant commits
12. **Create changesets** for all package changes
13. **TypeScript project references** must be updated when adding dependencies
14. **Workspace protocol** (`workspace:*`) for inter-package dependencies
15. **Each package builds independently** but build order is managed automatically

## Common Patterns

### Exporting from package index.ts

```typescript
export function myFunction() {
  // implementation
}

export type MyType = {
  // type definition
};
```

### Using Functions from Another Package

```typescript
// In @kosmic/server
import { capitalize } from "@kosmic/utils";

export function createTitle(input: string): string {
  return input
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}
```

### Testing with Cross-package Dependencies

```typescript
import { test, describe } from "node:test";
import assert from "node:assert";
import { createTitle } from "../src/index.ts";

void describe("@kosmic/server", async () => {
  await test("createTitle: capitalizes all words", () => {
    assert.strictEqual(createTitle("hello world"), "Hello World");
  });
});
```

### Testing with Mocks

```typescript
await test("mocks console.log", (t) => {
  const mockLog = t.mock.method(globalThis.console, "log");
  myFunction();
  assert.equal(mockLog.mock.calls.length, 1);
  t.mock.reset();
});
```

### Type-safe Array Access

```typescript
const items = [1, 2, 3];
const first = items[0]; // Type: number | undefined
if (first !== undefined) {
  // Safe to use first here
}
```

## Troubleshooting

### Build Issues

If builds fail or TypeScript can't find packages:

```bash
# Clean and rebuild everything
npm run build

# Check TypeScript configuration
npm run check

# Ensure workspace dependencies are linked
npm install
```

### Circular Dependencies

Avoid circular dependencies between packages. If package A depends on B, B should not depend on A. Refactor shared code into a common utility package if needed.

### Publishing Issues

If publishing fails:

1. Ensure you're authenticated with npm: `npm whoami`
2. Check NPM_TOKEN is set in GitHub Actions secrets
3. Verify package names are available on npm
4. Ensure all builds pass before publishing

### TypeScript Errors Across Packages

If you get "Cannot find module" errors:

1. Ensure the dependency is listed in package.json
2. Check tsconfig.json references are correct
3. Run `npm install` to link workspaces
4. Try building the dependency first: `npm run build -w @kosmic/utils`
