import { defineConfig } from 'tsup';

export default defineConfig([
  // Library entry — used by `require`/`import` and bundlers.
  {
    entry: { magnifier: 'src/index.ts' },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2019',
    outDir: 'dist',
    // Lets `require('a11y-magnifier')` resolve to the class directly instead
    // of `{ default: Magnifier }` — see the comment in src/index.ts.
    cjsInterop: true,
    splitting: true,
  },
  // CDN / plain <script> entry — sets `window.Magnifier`, no bundler needed.
  // `outExtension` pins the exact filename (tsup would otherwise double up
  // the ".global" suffix it already adds for the iife format).
  {
    entry: { magnifier: 'src/global.ts' },
    format: ['iife'],
    outExtension: () => ({ js: '.global.js' }),
    sourcemap: false,
    target: 'es2019',
    outDir: 'dist',
    clean: false,
  },
  {
    entry: { magnifier: 'src/global.ts' },
    format: ['iife'],
    outExtension: () => ({ js: '.global.min.js' }),
    minify: true,
    sourcemap: false,
    target: 'es2019',
    outDir: 'dist',
    clean: false,
  },
]);
