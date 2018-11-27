const webpack = require('webpack');
const devConfig = require('./webpack.config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

let prodConfig = {};

Object.keys(devConfig).forEach((key) => {
  prodConfig[key] = devConfig[key];
});

delete prodConfig.devtool;

prodConfig.entry = ['./index.webNew.js', 'whatwg-fetch'];

prodConfig.plugins = [
  new ExtractTextPlugin('styles.css'),
  new webpack.DefinePlugin({
    'process.env': {
      BROWSER: JSON.stringify(true),
      NODE_ENV: JSON.stringify('production'),
      WEB: JSON.stringify('true'),
      API_SERVER: JSON.stringify('')
    }
  }),
  new webpack.NamedModulesPlugin(),
];

prodConfig.mode = 'production';

prodConfig.module.rules = [
  {
    test: /\.svg$/,
    use: 'raw-loader'
  },
  {
    test: /\.css$|\.scss$/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: 'css-loader!postcss-loader'
    })
  },
  {
    test: /\.js$/,
    use: ['babel-loader'],
    exclude: /node_modules/,
    include: __dirname,
  }
];

module.exports = prodConfig;
