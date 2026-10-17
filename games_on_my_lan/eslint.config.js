import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/',
      'coverage/',
      'dist/',
      'build/',
      'temp/',
      'data/',
      'certs/',
      '.git/',
      '.eslintcache',
      'src/public/js/bootstrap.bundle.min.js',
    ],
  },

  {
    files: ['app.js', 'admin/**/*.js', 'src/**/*.js', 'tests/**/*.js', 'vitest.config.js'],
    ignores: ['src/public/js/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  {
    files: ['src/public/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: globals.browser,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },

  eslintConfigPrettier,
];
