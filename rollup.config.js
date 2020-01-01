import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default {
  input: ['src/index.ts'],
  output: [
    { file: pkg.main, format: 'cjs', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true }
  ],
  external: Object.keys(pkg.dependencies),
  plugins: [
    resolve(),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'ansi-colors': ['redBright', 'greenBright', 'dim']
      }
    }),
    json(),
    babel({ extensions: ['.js', '.ts'] }),
    typescript()
  ]
};
