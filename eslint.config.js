import { eslint } from '@eslint/js';
import { promises } from 'dns';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint, { parser } from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['dist', 'node_modules']
  },
  eslint.configs.recommended,
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        projectService: true,
        sourceType: 'module'
      },
      globals: {
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  }
);