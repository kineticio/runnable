import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { readFileSync } from 'node:fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: (id) => {
        // Externalize all dependencies and Node.js built-ins
        if (id.startsWith('node:') || id === 'worker_threads') {
          return true;
        }
        // Externalize package dependencies
        return Object.keys(pkg.dependencies || {}).some(
          (dep) => id === dep || id.startsWith(`${dep}/`),
        );
      },
      output: {
        // Preserve Node.js globals
        globals: {
          'node:path': 'path',
          'node:fs': 'fs',
          'node:url': 'url',
        },
      },
    },
    target: 'node20',
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
  },
  plugins: [
    dts({
      rollupTypes: false,
      outDir: 'dist',
    }),
  ],
  ssr: {
    noExternal: undefined,
  },
});
