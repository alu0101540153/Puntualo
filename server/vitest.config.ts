import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.spec.ts'],
    setupFiles: ['src/__tests__/setup.ts', 'src/__tests__/setupTests.ts'],
    globals: false,
    threads: false,
    hookTimeout: 60000,
    testTimeout: 30000
  },
});
