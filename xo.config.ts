import type {XoConfigItem} from 'xo';
import configReact from 'eslint-config-xo-react';

const reactConfig = configReact({space: true});

const xoConfig: XoConfigItem[] = [
  {
    ignores: [
      'test/temp',
      'coverage',
      '**/.vscode/**',
      '**/package.json',
      'packages/*/dist',
      'scripts/generate/package-template/**',
    ],
  },
  {
    prettier: true,
    space: true,
    rules: {
      'jsdoc/require-asterisk-prefix': 'off',
      'capitalized-comments': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'node-test/no-import-test-files': 'off',
      'unicorn/consistent-boolean-name': 'off',
      'unicorn/max-nested-calls': 'off',
      'unicorn/no-useless-re-export': 'off',
      'unicorn/prefer-continue': 'off',
      'unicorn/prefer-early-return': 'off',
      'unicorn/prefer-simple-condition-first': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    rules: {
      // Ensure we don't get empty module imports while using verbatim module syntax
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'off',
    },
  },
  {
    files: 'packages/*/src/**/*.ts',
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      // Enforce using .ts extensions for local imports in TS files
      // for native node.js type stripping support
      'import-x/extensions': [
        'error',
        'always',
        {
          ts: 'always',
          cts: 'always',
          mts: 'always',
          tsx: 'always',
          // Never allow relative js extensions in TS files
          js: 'never',
          jsx: 'never',
          cjs: 'never',
          mjs: 'never',
        },
      ],
    },
  },
  {
    ...reactConfig[0],
    files: ['apps/**/*.{ts,tsx,cts,mts,js,jsx,cjs,mjs}'],
  },
  {
    ...reactConfig[1],
    files: ['apps/**/*.{ts,tsx,cts,mts}'],
  },
  {
    files: ['apps/**/*.{ts,tsx,cts,mts,js,jsx,cjs,mjs}'],
    rules: {
      '@eslint-react/dom-no-dangerously-set-innerhtml': 'off',
      '@eslint-react/dom-no-unknown-property': 'off',
      '@eslint-react/no-missing-key': 'off',
      '@eslint-react/no-unstable-default-props': 'off',
      '@stylistic/jsx-child-element-spacing': 'off',
      '@stylistic/jsx-tag-spacing': 'off',
      'capitalized-comments': 'off',
      'import-x/extensions': 'off',
      'jsx-a11y-x/anchor-is-valid': 'off',
      'jsx-a11y-x/autocomplete-valid': 'off',
      'jsx-a11y-x/iframe-has-title': 'off',
      'jsx-a11y-x/label-has-associated-control': 'off',
      'no-console': 'error',
      'no-warning-comments': 'off',
      'react-hooks/immutability': 'off',
      'unicorn/prevent-abbreviations': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {argsIgnorePattern: 'next|props'},
      ],
    },
  },
  {
    files: ['apps/*/src/client/**/*.ts', 'apps/*/src/client/**/*.tsx'],
    rules: {
      'import-x/no-unassigned-import': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx,cts,mts}'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
    },
  },
  {
    files: ['packages/cli/src/test_/cli.ts'],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
];

export default xoConfig;
