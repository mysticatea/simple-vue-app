# simple-vue-app

[![npm version](https://img.shields.io/npm/v/simple-vue-app.svg)](https://www.npmjs.com/package/simple-vue-app)
[![Downloads/month](https://img.shields.io/npm/dm/simple-vue-app.svg)](http://www.npmtrends.com/simple-vue-app)
[![Build Status](https://travis-ci.org/mysticatea/simple-vue-app.svg?branch=master)](https://travis-ci.org/mysticatea/simple-vue-app)
[![Dependency Status](https://david-dm.org/mysticatea/simple-vue-app.svg)](https://david-dm.org/mysticatea/simple-vue-app)

This provides a CLI command to build a single page application (SPA) with [Vue.js].

    $ simple-vue-app src -o dist

This command transpiles from `src/index.html` and `src/index.js` to `dist/index.html`, `dist/index.js`, `dist/index.ie.js` and `dist/index.css`.

    $ simple-vue-app src -o dist -w

The `--watch` (or `-w`) option observes file changes then will rebuild on every change. It's fast.

## 💿 Installation

Use [npm].

```
$ npm install --save-dev simple-vue-app
```

- It requires [Node.js] v4 or later.

## 📖 Usage

```
Usage: build <source_dir> --output <output_dir> [OPTIONS]
       build <source_dir> -o <output_dir> [OPTIONS]
       build --help
       build --version

    Build a single page application powered by Vue.js.

    Prepare the following files:

    - '<source_dir>/index.html' is the main page.
    - '<source_dir>/index.js' is the entry file.

    Then this generates the following files:

    - '<output_dir>/index.html' is the main page.
    - '<output_dir>/index.css' is the main stylesheet.
    - '<output_dir>/index.js' is the main script.
    - '<output_dir>/index.ie.js' is the main script for IE11.

    Enjoy for development!

OPTIONS:
    --no-ie ....... The flag to not generate '<output_dir>/index.ie.js'.
    --watch, -w ... The flag to observe files and rebuild on every file change.
```

### Details

This command uses [browserify] with:

- [babelify] plugin to transpile JavaScript files with [transform-async-to-generator], [transform-vue-jsx], [transform-inline-environment-variables], and [babili].
- [vueify] plugin to transpile [Vue.js] single file components to JavaScript and CSS.
    - It transpile the JavaScript code with [babel] with above plugins/presets.
    - It transpile the CSS code with [PostCSS] with [autoprefixer], [postcss-import], [copy-assets], and [cssnano].
- Additionally, it generates a file for IE11 with [es2015] and [babel-polyfill].

If `--watch` option is given, `NODE_ENV` environment variable becomes `development`. Otherwise it becomes `production`.  
If `--watch` option is given, the generated files have source maps.

## 📰 Change log

See [GitHub Releases](https://github.com/mysticatea/simple-vue-app/releases)

## 💎 Contributing

Welcome ❤  
Please use GitHub's Issues/PRs.

[babel]: https://babeljs.io/
[babel-polyfill]: https://babeljs.io/docs/usage/polyfill/
[babelify]: https://www.npmjs.com/package/babelify
[babili]: https://www.npmjs.com/package/babel-preset-babili
[browserify]: http://browserify.org/
[copy-assets]: ./lib/postcss-copy-assets.js
[cssnano]: http://cssnano.co/
[es2015]: https://babeljs.io/docs/plugins/preset-es2015/
[Node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[transform-async-to-generator]: https://www.npmjs.com/package/babel-plugin-transform-async-to-generator
[transform-inline-environment-variables]: https://www.npmjs.com/package/babel-plugin-transform-inline-environment-variables
[transform-vue-jsx]: https://www.npmjs.com/package/babel-plugin-transform-vue-jsx
[Vue.js]: https://vuejs.org/
[vueify]: https://www.npmjs.com/package/vueify
[PostCSS]: http://postcss.org/
[autoprefixer]: https://www.npmjs.com/package/autoprefixer
[postcss-import]: https://www.npmjs.com/package/postcss-import
