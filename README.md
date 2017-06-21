# simple-vue-app

[![npm version](https://img.shields.io/npm/v/simple-vue-app.svg)](https://www.npmjs.com/package/simple-vue-app)
[![Downloads/month](https://img.shields.io/npm/dm/simple-vue-app.svg)](http://www.npmtrends.com/simple-vue-app)
[![Build Status](https://travis-ci.org/mysticatea/simple-vue-app.svg?branch=master)](https://travis-ci.org/mysticatea/simple-vue-app)
[![Dependency Status](https://david-dm.org/mysticatea/simple-vue-app.svg)](https://david-dm.org/mysticatea/simple-vue-app)

This provides a CLI command to build a single page application (SPA) with [Vue.js].

    $ simple-vue-app src -o dist

This command transpiles from `src/index.html` and `src/index.js` to `dist/index.html`, `dist/index.js` and `dist/index.css`.

    $ simple-vue-app src -o dist -w

The `--watch` (or `-w`) option observes file changes then will rebuild on every change. It's fast.

## 💿 Installation

Use [npm].

```
$ npm install --save-dev simple-vue-app
```

- It requires [Node.js] v8 or later.

## 📖 Usage

```
This is a tool to build a single page application powered by Vue.js.
This tool has some commands.

$ simple-vue-app [OPTIONS]

    The main command, this builds your cool application.

    OPTIONS:
        [SOURCE_DIR] ............... The source directory. Default is "src".
        --output, -o <OUTPUT_DIR> .. The output directory. Default is "out".
        --ie ....................... The flag to do additional processes for IE.
        --watch, -w ................ The flag to observe files and rebuild on 
                                     every file change.
        --include-compiler ......... The flag to use compilers of Vue.js.

    Prepare the following files:

    - '[SOURCE_DIR]/index.js'

    Then this will create the following files into <OUTPUT_DIR>:

    - 'index.html' is the main page.
    - 'index.css' is the main stylesheet.
    - 'index.js' is the main script.
    - 'index.js.map' is the source map of the main script.
    - And detected assets.

    That's almost all, enjoy for development!

$ simple-vue-app --test [OPTIONS]

    This runs the tests of your cool application with Karma + Mocha.

    OPTIONS:
        [SOURCE_DIR] ............... The source directory. Default is "test".
        --output, -o <OUTPUT_DIR> .. The output directory. Default is 
                                     ".test_workspace".
        --ie ....................... The flag to do additional processes for IE.
        --watch, -w ................ The flag to observe files and rebuild on 
                                     every file change.
        --include-compiler ......... The flag to use compilers of Vue.js.

    This builds '[SOURCE_DIR]/*.js' files then runs them by Karma + Mocha.

$ simple-vue-app --help

    Print this help text.

$ simple-vue-app --version

    Print this version number.
```

### Details

This command uses [rollup.js] with:

- [rollup-plugin-json]
- [rollup-plugin-url](./lib/build/rollup-plugin-url.js)
- [rollup-plugin-vue]
- [rollup-plugin-babel] with:
    - [babel-preset-env]
        - last 2 Chrome versions
        - last 2 Firefox versions
        - last 1 Edge versions
        - last 1 Safari versions
        - last 1 IE versions (only when you gave `--ie` option)
    - [babel-plugin-transform-vue-jsx]
    - [babel-plugin-transform-inline-environment-variables]
    - [babel-plugin-minify-constant-folding]
    - [babel-plugin-minify-dead-code-elimination]
    - [babel-polyfill]
- [rollup-plugin-commonjs]
- [rollup-plugin-resolve] with extensions `.js`, `.json`, and `.vue`

And use [PostCSS] for CSS of `.vue` files:

- [autoprefixer]
- [postcss-calc]
- [postcss-custom-properties]
- [postcss-import]
- [postcss-url](./lib/build/postcss-url.js)

If `--watch` option is given, `NODE_ENV` environment variable becomes `development`. Otherwise it becomes `production`.  
If `--watch` option is given, the generated files have source maps.

## 📰 Change log

See [GitHub Releases](https://github.com/mysticatea/simple-vue-app/releases)

## 💎 Contributing

Welcome ❤  
Please use GitHub's Issues/PRs.

[babel]: https://babeljs.io/
[babel-preset-env]: https://github.com/babel/babel-preset-env
[babel-plugin-transform-vue-jsx]: https://www.npmjs.com/package/babel-plugin-transform-vue-jsx
[babel-plugin-transform-inline-environment-variables]: https://www.npmjs.com/package/babel-plugin-transform-inline-environment-variables
[babel-plugin-minify-constant-folding]: https://www.npmjs.com/package/babel-plugin-minify-constant-folding
[babel-plugin-minify-dead-code-elimination]: https://www.npmjs.com/package/babel-plugin-minify-dead-code-elimination
[babel-polyfill]: https://babeljs.io/docs/usage/polyfill/
[babili]: https://www.npmjs.com/package/babel-preset-babili
[cssnano]: http://cssnano.co/
[rollup.js]: https://rollupjs.org/
[rollup-plugin-json]: https://www.npmjs.com/package/rollup-plugin-json
[rollup-plugin-vue]: https://www.npmjs.com/package/rollup-plugin-vue
[rollup-plugin-babel]: https://www.npmjs.com/package/rollup-plugin-babel
[rollup-plugin-commonjs]: https://www.npmjs.com/package/rollup-plugin-commonjs
[rollup-plugin-resolve]: https://www.npmjs.com/package/rollup-plugin-resolve
[Node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[Vue.js]: https://vuejs.org/
[PostCSS]: http://postcss.org/
[autoprefixer]: https://www.npmjs.com/package/autoprefixer
[postcss-calc]: https://www.npmjs.com/package/postcss-calc
[postcss-custom-properties]: https://www.npmjs.com/package/postcss-custom-properties
[postcss-import]: https://www.npmjs.com/package/postcss-import
