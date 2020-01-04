import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const external = Object.keys(pkg.dependencies);

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true }
    ],
    external,
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
  }
  // TODO Throwing error:
  //
  // [!] Error: Unexpected token (Note that you need plugins to import files that are not JavaScript)
  // src/commands.ts (5:7)
  // 3: import mri from 'mri';
  // 4:
  // 5: export type RunCommands = (argv: string[], help?: string) => Promise<void>;
  //
  // {
  //   input: 'src/index.ts',
  //   output: [{ file: pkg.types, format: 'es' }],
  //   plugins: [dts()]
  // }
];
