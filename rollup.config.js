import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import babel from 'rollup-plugin-babel';

export default {
  input: ['src/index.ts'],
  output: {
    format: 'cjs',
    dir: 'lib',
    sourcemap: true
  },
  plugins: [resolve(), commonjs(), json(), babel({ extensions: ['.js', '.ts'] }), typescript()]
};
