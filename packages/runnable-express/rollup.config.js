import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import pkg from './package.json' assert { type: 'json' };

const external = [
  ...Object.keys(pkg.dependencies),
  // ...Object.keys(pkg.peerDependencies || {}),
  'worker_threads',
];

const plugins = [
  alias({
    entries: [{ find: /^node:(.+)$/, replacement: '$1' }],
  }),
  resolve({
    preferBuiltins: true,
  }),
  json(),
  commonjs(),
  esbuild({
    target: 'node14',
  }),
];

export default () => [
  {
    input: ['./src/index.ts'],
    output: {
      dir: 'dist',
      format: 'cjs',
    },
    external,
    plugins,
  },
  {
    input: './src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'cjs',
    },
    external,
    plugins: [dts()],
  },
];
