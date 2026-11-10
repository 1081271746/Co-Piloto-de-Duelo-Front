import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
  esbuild: { tsconfigRaw: { compilerOptions: { experimentalDecorators: true } } },
});
