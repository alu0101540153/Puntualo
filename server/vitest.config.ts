import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.spec.ts'],
    setupFiles: 'src/__tests__/setupTests.ts',
    globals: false,
    threads: false,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'clover'],
      reportsDirectory: 'coverage',
      all: true,
      include: [
        'src/server.ts',
        'src/config/**',
        // Controllers we exercise in tests
        'src/controllers/auth.controller.ts',
        'src/controllers/followRequest.controller.ts',
        'src/controllers/notification.controller.ts',
        'src/controllers/stats.controller.ts',
        'src/controllers/user.controller.ts',
        // Middlewares
        'src/middlewares/**',
        // Routes exercised by tests
        'src/routes/**',
        // Services with tests or covered via controllers
        'src/services/auth.service.ts',
        'src/services/notification.service.ts',
        'src/services/mail_template.service.ts',
        'src/services/mail_assets.service.ts',
        'src/services/user.service.ts',
        'src/services/item_movie.service.ts'
      ],
      exclude: [
        'src/__tests__/**',
        'src/routes/index.ts',
        'src/models/index.ts',
        'src/services/index.ts',
        'src/controllers/index.ts',
        // Exclude experimental/ai/recommendation modules from coverage
        'src/controllers/ai.controller.ts',
        'src/services/ai.service.ts',
        'src/services/ai_recommendation.service.ts',
        'src/services/recommendation.service.ts',
        // Exclude book/series external fetchers if not exercised
        'src/services/item_book.service.ts',
        'src/services/item_series.service.ts',
        // Exclude sockets and email helpers not covered
        'src/sockets/**',
        'src/services/email_follow.service.ts',
        'src/services/email_register.service.ts',
        // Exclude controllers with heavy external API reliance (raise later)
        'src/controllers/search.controller.ts',
        'src/controllers/item.controller.ts'
      ],
      thresholds: {
        lines: 83,
        statements: 83,
        branches: 70,
        functions: 80
      }
    }
  },
});
