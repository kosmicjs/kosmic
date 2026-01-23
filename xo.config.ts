import type {XoConfigItem} from 'xo';

const xoConfig: XoConfigItem[] = [
  {ignores: ['test/temp', 'coverage', 'packages/*/dist']},
  {
    prettier: true,
    space: true,
    rules: {
      'capitalized-comments': 'off',
      '@typescript-eslint/naming-convention': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    rules: {
      // Ensure we don't get empty module imports while using verbatim module syntax
      '@typescript-eslint/no-import-type-side-effects': 'error',
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
    files: ['apps/**/*.{ts,tsx,cts,mts,js,jsx,cjs,mjs}'],
    space: true,
    prettier: true,
    react: true,
    rules: {
      'capitalized-comments': 'off',
      'import-x/extensions': 'off',
      'no-console': 'error',
      'no-warning-comments': 'off',
      'react/jsx-key': 'off',
      'react/no-unknown-property': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/self-closing-comp': 'off',
      'unicorn/prevent-abbreviations': 'off',
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
];

export default xoConfig;
