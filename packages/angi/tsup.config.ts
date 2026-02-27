import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      'client/index': 'src/client/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false, // clean is handled by npm run clean
    external: ['react', 'react-dom', '@anthropic-ai/sdk'],
    esbuildOptions(options) {
      options.banner = {
        js: '"use client";',
      };
    },
  },
  {
    entry: {
      'server/index': 'src/server/index.ts'
    },
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false, // clean is handled by npm run clean
    external: ['react', 'react-dom', '@anthropic-ai/sdk'],
  }
]);
