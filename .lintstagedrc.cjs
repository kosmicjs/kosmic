module.exports = {
  '*.md,!test/**/*.md': 'prettier --check',
  './package.json':
    'prettier --write --plugin=prettier-plugin-packagejson ./package.json',
  '*.{js,ts,jsx,tsx}': 'xo --fix',
};
