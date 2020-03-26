module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jquery: true,
    mocha: true,
  },
  root: true,
  extends: [
    "eslint:recommended",
    "airbnb-base",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
  },

  rules: {
    quotes: [2, "double"],
    indent: 2,
    "no-param-reassign": 0,
    "import/extensions": 0,
    "import/no-unresolved": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "consistent-return": 0,
  },
};
