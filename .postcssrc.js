// Common plugins
const retPlugins = [
  'postcss-preset-env',
];

// Add purge css if needed
if (Array.isArray(global.purgeCSSContent)) {
  const purgeCSSPlugin = ['@fullhuman/postcss-purgecss', {
    content: global.purgeCSSContent,
  }];

  retPlugins.push(purgeCSSPlugin);
}

module.exports = {
  plugins: retPlugins,
};
