import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    sequence: {
      concurrent: false,
    },
    singleThread: true,
    maxConcurrency: 1,
    minWorkers: 1,
    maxWorkers: 1,
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    include: ["tests/unit/**/*.test.js", "tests/integration/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "tests/**",
        "**/*.test.js",
        "**/*.config.js",
      ],
    },
  },
});