import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom environment for DOM testing
    environment: 'jsdom',

    // Clear mocks before every test
    clearMocks: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
    },

    // Test file patterns
    include: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],

    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
  },
});
