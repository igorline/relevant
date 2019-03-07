module.exports = {
  plugins: {
    'postcss-import': {
      // addModulesDirectories: ['app', 'app/components'],
      path: ['app', 'app/components']
    },
    precss: {},
    autoprefixer: {},
    'postcss-easings': {},
  }
};
