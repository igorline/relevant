const webpack = require('webpack');
const devConfig = require('./webpack.config');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const prodConfig = {};
const isAnalyze = typeof process.env.BUNDLE_ANALYZE !== 'undefined';

Object.keys(devConfig).forEach((key) => {
  prodConfig[key] = devConfig[key];
});

delete prodConfig.devtool;

prodConfig.entry = {
  app: ['./index.web.js', 'whatwg-fetch'],
};

prodConfig.plugins = [
  // new ExtractTextPlugin('styles.css'),
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: '[name].css',
    chunkFilename: '[id].css'
  }),
  new webpack.DefinePlugin({
    'process.env': {
      BROWSER: JSON.stringify(true),
      NODE_ENV: JSON.stringify('production'),
      WEB: JSON.stringify('true'),
      API_SERVER: JSON.stringify('')
    }
  }),
  new webpack.NamedModulesPlugin(),
  new LoadablePlugin(),
];

prodConfig.mode = 'production';

prodConfig.module.rules = [
  {
    test: /\.(png|woff|woff2|eot|ttf|svg|jpg)$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
    ]
  },
  {
    test: /\.css$|\.scss$/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        // fallback: 'style-loader',
      },
      'css-loader',
      'postcss-loader'
      // use: 'css-loader!postcss-loader'
    ]
  },
  {
    test: /\.(js|svg)$/,
    use: [{
      loader: 'babel-loader',
      options: {
        babelrc: true,
        // This is a feature of `babel-loader` for Webpack (not Babel itself).
        // It enables caching results in ./node_modules/.cache/babel-loader/
        // directory for faster rebuilds.
        cacheDirectory: true,
      },
    }],
    exclude: /node_modules/,
    include: __dirname,
  }
];

if (isAnalyze) {
  prodConfig.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = prodConfig;
