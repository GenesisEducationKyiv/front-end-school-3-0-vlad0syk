import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: [
      'src/tests/e2e/**',
      'src/tests/component/**',
    ],
  },
}); 