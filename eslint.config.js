import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import typescriptEslint from '@typescript-eslint/eslint-plugin';

// Базові налаштування для всіх файлів
const baseConfig = {
  ignores: [
    'dist',
    'node_modules',
    '.nx/',
    '.storybook/',
    'src/stories/',
    'playwright.config.ts',
    'vitest.config.ts',
  ],
};

// Конфігурація для TypeScript файлів
const typescriptConfig = {
  files: ['**/*.{ts,tsx}'],
  ignores: [
    '.storybook/**', 
    'src/stories/**', 
    '**/*.stories.tsx',
    '**/*.d.ts' // Ignore .d.ts files to avoid parsing errors
  ],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: ['./tsconfig.app.json', './tsconfig.node.json'],
      tsconfigRootDir: import.meta.dirname,
      warnOnUnsupportedTypeScriptVersion: false,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
    globals: globals.browser,
  },
  plugins: {
    '@typescript-eslint': typescriptEslint,
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
  },
};

// Конфігурація для Storybook файлів
const storybookConfig = {
  files: ['.storybook/**/*.ts', 'src/stories/**/*.tsx'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: ['./.storybook/tsconfig.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    // Додаткові правила для Storybook
  },
};

// Експортуємо конфігурацію
// @ts-ignore
const config = tseslint.config(
  baseConfig,
  typescriptConfig,
  storybookConfig
);

export default config;