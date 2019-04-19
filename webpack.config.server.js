// const LoadablePlugin = require('@loadable/webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  devtool: 'source-map',
  target: 'node',
  entry: {
    app: ['@babel/polyfill', './server/auth/auth.service.js']
  },
  output: {
    path: path.join(__dirname, '/server/dist/'),
    filename: 'bundle.js',
    // chunkFilename: '[name].bundle.js',
    publicPath: '/',
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals()],
  // mode: 'development',
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //     // maxInitialRequests: Infinity,
  //     // minSize: 0,
  //     cacheGroups: {
  //       default: false,
  //       vendors: false,
  //       // vendor chunk
  //       vendor: {
  //         // sync + async chunks
  //         chunks: 'all',
  //         // import file path containing node_modules
  //         test: /node_modules/,
  //         name(module) {
  //           // get the name. E.g. node_modules/packageName/not/this/part.js
  //           // or node_modules/packageName
  //           const packageName = module.context.match(
  //             /[\\/]node_modules[\\/](.*?)([\\/]|$)/
  //           )[1];

  //           // npm package names are URL-safe, but some servers don't like @ symbols
  //           return `npm.${packageName.replace('@', '')}`;
  //         },
  //         reuseExistingChunk: true,
  //         // priority
  //         priority: 20
  //       },
  //       // common chunk
  //       common: {
  //         chunks: 'all',
  //         name: 'common',
  //         minChunks: 2,
  //         priority: 10,
  //         reuseExistingChunk: true,
  //         enforce: true
  //       }
  //     }
  //   }
  // },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.NoEmitOnErrorsPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        BROWSER: JSON.stringify(true),
        DEVTOOLS: JSON.stringify(true), // <-------- DISABLE redux-devtools HERE
        NODE_ENV: JSON.stringify('development'),
        WEB: JSON.stringify('true'),
        API_SERVER: JSON.stringify(''),
        BABEL_ENV: JSON.stringify('development_web')
      }
    }),
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    })
    // new LoadablePlugin({
    //   filename: 'loadable-stats-dev.json',
    //   writeToDisk: true
    // })
  ],
  resolve: {
    symlinks: false,
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react-native$': 'react-native-web',
      'react-native-linear-gradient$': 'react-native-web-linear-gradient'
    }
  },

  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  },

  module: {
    exprContextRegExp: /$^/,
    exprContextCritical: false,
    rules: [
      {
        test: /\.(png|woff|woff2|eot|ttf|svg|jpg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.css$|\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
            // fallback: 'style-loader',
          },
          'css-loader',
          'postcss-loader'
          // use: 'css-loader!postcss-loader'
        ]
      },
      {
        test: /\.(js|svg)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
              // This is a feature of `babel-loader` for Webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: true
            }
          }
        ],
        exclude: /node_modules/,
        include: __dirname
      }
    ]
  }
};
