module.exports = {
  extends: [
    'react-app'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-dupe-keys': 'warn'
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true
  }
};
