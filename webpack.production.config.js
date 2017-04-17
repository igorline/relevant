let ExtractTextPlugin = require('extract-text-webpack-plugin');
let webpack = require('webpack');
let devConfig = require('./webpack.config');

let prodConfig = {};

Object.keys(devConfig).forEach((key) => {
  prodConfig[key] = devConfig[key];
});

delete prodConfig.devtool;

prodConfig.entry = ['./index.web.js', 'whatwg-fetch'];

prodConfig.plugins = [
  new ExtractTextPlugin('styles.css'),
  new webpack.DefinePlugin({
    'process.env': {
      BROWSER: JSON.stringify(true),
      NODE_ENV: JSON.stringify('production'),
      WEB: JSON.stringify('true'),
      API_SERVER: JSON.stringify('')
    }
  })
];

prodConfig.module.loaders = [
  {
    test: /\.css$|\.scss$/,
    loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader')
  },
  {
    test: /\.js$/,
    loader: 'babel',
    exclude: /node_modules/,
    include: __dirname,
  }
];

module.exports = prodConfig;
