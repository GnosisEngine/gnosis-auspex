# Gnosis: Auspex

The graphic engine for Gnosis

## Install

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/GnosisEngine/auspex)

`npm i -S @gnosis/auspex` or `yarn add @gnosis/auspex`

## Testing

Add your tests to the [`tests`](tests) folder, then import them in the [`tests/index.ts`](tests/index.ts) file.

* [Upload meta.json here for a bundle analysis](https://www.bundle-buddy.com/esbuild)
* [Reduce Phaser file size](https://github.com/photonstorm/phaser3-custom-build)

## CLI

### yarn

- `"yarn prepare-assets"`: Prepares the `dist` folder
- `"yarn compile"`: Compiles all TS to an unminified `dist/index.js` build.  (Run `dist/index.html` to test the code)
- `"yarn build"`: Compiles all TS to a minified `dist/index.js` build.  (Run `dist/index.html` to test the code)
- `"yarn dev"`: Compiles all TS to an unminified and watched `dist/index.js` build.  (Run `dist/index.html` to test the code)
- `"yarn test"`: Runs all tests
