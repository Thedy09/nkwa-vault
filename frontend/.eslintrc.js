module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-dupe-keys': 'warn'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  }
};
