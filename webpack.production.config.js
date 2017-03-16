
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack');

var devConfig = require('./webpack.config');

var prodConfig = {};

Object.keys(devConfig).forEach(function(key) {
  prodConfig[key] = devConfig[key];
});

delete prodConfig.devtool;

prodConfig.entry = ['./index.web.js'];

prodConfig.plugins = [
  new ExtractTextPlugin("styles.css"),
  new webpack.DefinePlugin({
    "process.env":{
      BROWSER: JSON.stringify(true),
      NODE_ENV: JSON.stringify('production'),
      WEB: JSON.stringify(true)
    }
  })
]

prodConfig.module.loaders = [
  {
    test: /\.css$|\.scss$/,
    loader: ExtractTextPlugin.extract('style-loader','css-loader!postcss-loader')
  },
  {
    test: /\.js$/,
    loader: 'babel',
    exclude: /node_modules/,
    include: __dirname,
  }
];

module.exports = prodConfig;
