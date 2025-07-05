const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const terser = require('@rollup/plugin-terser');
const typescript = require('rollup-plugin-typescript2');
const { dts } = require('rollup-plugin-dts');

module.exports = [
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        useTsconfigDeclarationDir: true
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      })
    ]
  },

  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        useTsconfigDeclarationDir: true
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      })
    ]
  },

  // UMD build (minified)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/smart-browser-detection.min.js',
      format: 'umd',
      name: 'SmartBrowserDetection',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        useTsconfigDeclarationDir: true
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      terser()
    ]
  },

  // UMD build (unminified)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/smart-browser-detection.js',
      format: 'umd',
      name: 'SmartBrowserDetection',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        useTsconfigDeclarationDir: true
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      })
    ]
  },

  // TypeScript declaration files
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];
