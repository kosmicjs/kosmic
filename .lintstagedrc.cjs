module.exports = {
  '**/*.md,!**/test/**/*.md': 'prettier --write',
  '**/package.json': 'prettier --write --plugin=prettier-plugin-packagejson',
  '**/*.{js,ts}': 'xo --fix',
};
