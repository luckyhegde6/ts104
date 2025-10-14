module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
    extends: [
  'eslint:recommended',
  'plugin:@typescript-eslint/recommended',
  'plugin:prettier/recommended'
],
  env: { node: true, jest: true, es2021: true },
  rules: {}
};
