module.exports = {
  env: {
    browser: true,
    es2021: true,
    "jest": true
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-plusplus': 'off',
    "indent": [2, "tab"],
    "no-tabs": 0,
    'no-bitwise': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-globals': 'off'
  },
};
