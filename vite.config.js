import { defineConfig } from 'vite';

// Relative base keeps the build portable: static hosting sub-folders,
// file:// style wrappers and future Capacitor (iOS) packaging all work.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
