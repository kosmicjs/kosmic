# spence-s-monorepo-template

[![Node.js CI](https://github.com/spence-s/spence-s-monorepo-template/actions/workflows/node.js.yml/badge.svg?branch=main&event=push)](https://github.com/spence-s/spence-s-monorepo-template/actions/workflows/node.js.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)

A bleeding edge, prod ready monorepo starter template for creating and publishing multiple [Node.js](https://nodejs.org) packages to [npm](https://www.npmjs.com/).

## Features

- MIT License
- npm workspaces for monorepo management
- Configured for [pure ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) output
- TypeScript project references for fast, efficient builds
- Easy out-of-the-box development with [watch](https://nodejs.org/api/cli.html#--watch) and [native type stripping](https://nodejs.org/docs/latest/api/typescript.html#modules-typescript)
- [Editorconfig](https://editorconfig.org/) for collaboration
- Testing with [node's native test runner](https://nodejs.org/api/test.html) - pre-setup for TypeScript ESM
- CI runs on Node.js 20, 22, and 24 for pushes and pull requests to main in [github actions](https://github.com/features/actions)
- Linting with [xo](https://github.com/xojs/xo) (space configuration)
- Formatting with [prettier](https://prettier.io/) and [xo](https://github.com/xojs/xo)
- Markdown linting and formatting with [prettier](https://prettier.io/)
- Package.json linting and formatting with [prettier-plugin-package-json](https://www.npmjs.com/package/prettier-plugin-packagejson)
- Sane package.json scripts across all packages
- [Husky](https://typicode.github.io/husky/) for git hooks management
- [lint-staged](https://github.com/okonet/lint-staged) for pre-commit linting
- [Commitlint](https://commitlint.js.org/) with conventional commits
- [Changesets](https://github.com/changesets/changesets) for versioning and publishing to npm
- Automated releases via GitHub Actions

## Monorepo Structure

This template uses npm workspaces to manage multiple packages in a single repository:

```
spence-s-monorepo-template/
├── packages/
│   ├── utils/          # @spence-s/utils - Shared utilities
│   └── core/           # @spence-s/core - Core functionality
├── .changeset/         # Changesets configuration
├── .github/            # CI/CD workflows
├── .husky/             # Git hooks
├── package.json        # Root package (private, defines workspaces)
├── tsconfig.json       # Root TypeScript config (solution file)
└── xo.config.ts        # Shared linting configuration
```

Each package in `packages/` is independently publishable to npm but shares common configuration and tooling.

## Prerequisites

- [Node.js](https://nodejs.org) version 22 or higher
- npm (comes with Node.js)

## Getting Started

### Installation

This is a GitHub template and is best used by using the GitHub UI to start a new project.

Once you've cloned the template for a new repository:

1. Run `npm install` to install all dependencies (including workspace packages)
2. Run `npm run update` to interactively update all dependencies to their latest versions
3. Run `npm test` to ensure everything works correctly

### Customizing for Your Project

After cloning this template, you'll want to customize it for your specific project. Here's a checklist:

#### Root Level

- [ ] Update `name` in root package.json to your monorepo name
- [ ] Update `description` in root package.json
- [ ] Update `repository.url` in root package.json with your repository URL
- [ ] Update `homepage` and `bugs.url` in root package.json
- [ ] Update the author name in LICENSE file
- [ ] Update this README.md with your project's information

#### For Each Package

- [ ] Update package `name` in package.json (e.g., `@your-org/package-name`)
- [ ] Update `description` in package.json
- [ ] Update `author` information in package.json
- [ ] Update `keywords` in package.json
- [ ] Replace the example code in `src/` with your actual code
- [ ] Update the tests in `test/` for your code
- [ ] Update package references in root `tsconfig.json`

### Run Example Code

The template includes two example packages to demonstrate the monorepo structure:

```bash
# Build all packages
npm run build

# Run tests for all packages
npm test

# Run tests for a specific package
npm test -w @spence-s/core
```

## Working with Packages

### Adding a New Package

1. **Create the package directory:**

   ```bash
   mkdir -p packages/my-package/src packages/my-package/test
   ```

2. **Create package.json** (copy from `packages/utils/package.json` as template)

3. **Create tsconfig.json** (copy from `packages/utils/tsconfig.json` as template)

4. **Add package reference to root `tsconfig.json`:**

   ```json
   {
     "files": [],
     "references": [
       { "path": "./packages/utils" },
       { "path": "./packages/core" },
       { "path": "./packages/my-package" }
     ]
   }
   ```

5. **Link the workspace:**
   ```bash
   npm install
   ```

### Installing Dependencies

```bash
# Add dependency to specific package
npm install lodash -w @spence-s/core

# Add workspace dependency (in package.json)
{
  "dependencies": {
    "@spence-s/utils": "workspace:*"
  }
}
```

### Building and Testing

```bash
# Build all packages
npm run build

# Build specific package
npm run build -w @spence-s/utils

# Test all packages
npm test

# Test specific package
npm test -w @spence-s/core

# Type-check all packages
npm run check

# Lint all packages
npm run lint
```

## Publishing with Changesets

This monorepo uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

### Creating a Changeset

When you make changes to a package:

```bash
npm run changeset
```

This will prompt you to:

- Select which packages changed
- Specify the semver bump (major/minor/patch)
- Write a summary of the changes

The summary you write becomes the changelog entry.

### Versioning Packages

When you're ready to publish, update package versions:

```bash
npm run version
```

This updates package.json versions and generates CHANGELOG.md files based on changesets.

Commit the changes:

```bash
git add .
git commit -m "chore: version packages"
```

### Publishing to npm

```bash
npm run release
```

This builds all packages and publishes changed packages to npm.

### Automated Releases (CI)

The GitHub Actions workflow automatically handles releases:

1. When changes are merged to main with changesets
2. A "Version Packages" PR is automatically created
3. Merging this PR triggers automatic publishing to npm

**Setup required:**

- Add `NPM_TOKEN` to your GitHub repository secrets
- The token needs publish access to your npm packages

## Scripts

The root package.json provides workspace-level scripts:

```json
{
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "changeset": "changeset",
    "check": "npm run check --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "prepare": "husky",
    "release": "npm run build && changeset publish",
    "test": "npm run test --workspaces --if-present",
    "test:coverage": "npm run test:coverage --workspaces --if-present",
    "update": "ncu -i",
    "version": "changeset version"
  }
}
```

- `build`: Build all workspace packages
- `changeset`: Create a changeset for package changes
- `check`: Type-check all packages without building
- `lint`: Run XO linter across all packages
- `prepare`: Set up Husky git hooks
- `release`: Build and publish changed packages to npm
- `test`: Run tests across all packages
- `test:coverage`: Run tests with coverage across all packages
- `update`: Interactively update dependencies
- `version`: Update package versions based on changesets

## Contributing

This project uses [Commitlint](https://commitlint.js.org/) with conventional commits. When making commits, please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Examples:

- `feat(utils): add new string utility`
- `fix(core): resolve memory leak`
- `docs: update README with examples`
- `chore: update dependencies`

Pre-commit hooks will automatically lint your staged files using [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged).

## TypeScript

The tsconfig included in this template is set up for Node.js native type stripping and includes the `erasableSyntaxOnly` option, so not all TypeScript features are supported. This decision was made to encourage adoption of cutting edge Node.js features which improve DX. We continue to maintain a build and release option for packaging only JavaScript files, as node native type stripping will not strip imports from `node_modules` folders.

### TypeScript Project References

This monorepo uses TypeScript project references for:

- **Faster builds** - Only rebuild changed packages
- **Better IDE support** - Go-to-definition works across packages
- **Enforced dependency graph** - TypeScript ensures correct build order

Each package has `"composite": true` in its tsconfig.json and declares dependencies in its `"references"` array.

Learn More:

- [TypeScript Modules](https://nodejs.org/api/typescript.html)
- [Erasable Syntax Only Reference](https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

## Example Packages

### @spence-s/utils

A utility package demonstrating basic package structure with:

- String utilities (capitalize, slugify)
- Number utilities (clamp)
- Full test coverage
- TypeScript type definitions

### @spence-s/core

A core package demonstrating:

- Inter-package dependencies (depends on `@spence-s/utils`)
- TypeScript project references
- Building on top of shared utilities
- Config object creation

## License

MIT © [Spencer Snyder](https://spencersnyder.io)
