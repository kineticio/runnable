const base = require('./eslint-preset');

module.exports = {
  ...base,
  extends: [...base.extends, 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
  parserOptions: {
    tsconfigRootDir: process.cwd(),
    project: ['./tsconfig.json'],
  },
  rules: {
    ...base.rules,
    '@typescript-eslint/no-confusing-void-expression': 'error',
    '@typescript-eslint/no-meaningless-void-operator': 'error',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/non-nullable-type-assertion-style': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
  },
};
