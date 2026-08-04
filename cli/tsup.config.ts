import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['cjs'],
  target: 'node16',
  clean: true,
  minify: false,
  outDir: 'dist',
});
