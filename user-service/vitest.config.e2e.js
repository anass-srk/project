import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/e2e/**/*.test.js"],
    sequence: {
      concurrent: false,
    },
    maxConcurrency: 1,
    minWorkers: 1,
    maxWorkers: 1,
  },
});