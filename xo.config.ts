import {type FlatXoConfig, TS_FILES_GLOB} from 'xo';

const config: FlatXoConfig = [
  {
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
      'unicorn/no-array-reduce': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    files: [TS_FILES_GLOB],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {argsIgnorePattern: 'next|props'},
      ],
    },
  },
  {
    files: ['src/client/**/*.ts', 'src/client/**/*.tsx'],
    rules: {
      'import-x/no-unassigned-import': 'off',
    },
  },
];

export default config;
