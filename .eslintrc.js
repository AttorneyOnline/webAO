module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    "indent": ["warn", 2],
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
  },
};
