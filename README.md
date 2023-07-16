<!-- Title -->
<h1 align="center">
  i18next-test
</h1>

<!-- Description -->
<h4 align="center">
  Check <code>i18next</code> locale files for missing translations and common errors.
</h4>

<!-- Badges -->
<p align="center">
  <a href="https://www.npmjs.com/package/@devoxa/i18next-test">
    <img
      src="https://img.shields.io/npm/v/@devoxa/i18next-test?style=flat-square"
      alt="Package Version"
    />
  </a>

  <a href="https://github.com/devoxa/i18next-test/actions?query=branch%3Amaster+workflow%3A%22Continuous+Integration%22">
    <img
      src="https://img.shields.io/github/actions/workflow/status/devoxa/i18next-test/push.yml?branch=master&style=flat-square"
      alt="Build Status"
    />
  </a>

  <a href="https://codecov.io/github/devoxa/i18next-test">
    <img
      src="https://img.shields.io/codecov/c/github/devoxa/i18next-test/master?style=flat-square"
      alt="Code Coverage"
    />
  </a>
</p>

<!-- Quicklinks -->
<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributors">Contributors</a> •
  <a href="#license">License</a>
</p>

<br>

## Installation

```bash
yarn add @devoxa/i18next-test
```

## Usage

```bash
i18next-test -c i18next-test.config.js
```

```js
// i18next-test.config.js
module.exports = {
  // This is the default locale of your source files
  defaultLocale: 'en',

  // This is the path to your locale files on the file system, with the files named
  // following the `${localePath}/${locale}/${namespace}.json` pattern
  localePath: './public/locales',

  // This is the (unused) default namespace of your translations
  defaultNamespace: 'undefined',

  // (Optional) This is an array of regular expressions describing text that should not be in the
  // translations. It can be used for making sure that the overall voice of the translations
  // is consistent (e.g. that "sign in" is always used instead of "login").
  prohibitedText: [/\blog.?in\b/i],
}
```

Note that the configuration file has a similar structure to
[`i18next-parser`](https://github.com/i18next/i18next-parser), so you can use a single file for
both.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://www.david-reess.de"><img src="https://avatars3.githubusercontent.com/u/4615516?v=4" width="75px;" alt=""/><br /><sub><b>David Reeß</b></sub></a><br /><a href="https://github.com/devoxa/i18next-test/commits?author=queicherius" title="Code">💻</a> <a href="https://github.com/devoxa/i18next-test/commits?author=queicherius" title="Documentation">📖</a> <a href="https://github.com/devoxa/i18next-test/commits?author=queicherius" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!

## License

MIT
