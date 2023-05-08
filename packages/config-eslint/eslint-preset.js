module.exports = {
  env: {
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'import'],
  root: true,
  rules: {
    eqeqeq: 'error',
    semi: 'error',
    'semi-spacing': 'error',
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    'array-bracket-spacing': ['error', 'never'],
    '@typescript-eslint/no-shadow': ['error'],
    'object-shorthand': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
    'import/no-unresolved': 'off',
    'import/order': [
      'error',
      {
        groups: [
          'builtin', // Built-in imports (come from NodeJS native) go first
          'external', // <- External imports
          // 'internal'[('sibling', 'parent')], // <- Absolute imports // <- Relative imports, the sibling and parent types they can be mingled together
          'index', // <- index imports
          'unknown' // <- unknown
        ],
        'newlines-between': 'always',
        alphabetize: {
          /* sort in ascending order. Options: ["ignore", "asc", "desc"] */
          order: 'asc',
          /* ignore case. Options: [true, false] */
          caseInsensitive: true
        }
      }
    ]
  },
  overrides: [
    // {
    //   files: ['*.gql'],
    //   parser: '@graphql-eslint/eslint-plugin',
    //   plugins: ['@graphql-eslint'],
    //   rules: {
    //     '@graphql-eslint/known-type-names': 'off',
    //     '@graphql-eslint/naming-convention': 'error',
    //     '@graphql-eslint/require-description': 'off',
    //     '@graphql-eslint/strict-id-in-types': 'off',
    //     '@graphql-eslint/no-unreachable-types': 'warn'
    //   },
    //   extends: ['plugin:@graphql-eslint/schema-recommended']
    // }
  ]
};
