const LoadablePlugin = require('@loadable/webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: {
    app: ['./index.web.js', 'whatwg-fetch', 'webpack-hot-middleware/client?quiet=true']
  },
  output: {
    path: path.join(__dirname, '/app/public/dist/'),
    filename: 'bundle.js',
    chunkFilename: '[name].bundle.js',
    publicPath: '/dist/'
  },
  mode: 'development',
  optimization: {
    splitChunks: {
      chunks: 'all',
      // maxInitialRequests: Infinity,
      // minSize: 0,
      cacheGroups: {
        default: false,
        vendors: false,
        // vendor chunk
        vendor: {
          // sync + async chunks
          chunks: 'all',
          // import file path containing node_modules
          test: /node_modules/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`;
          },
          reuseExistingChunk: true,
          // priority
          priority: 20
        },
        // common chunk
        common: {
          chunks: 'all',
          name: 'common',
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
          enforce: true
        }
      }
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
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
    new LoadablePlugin({
      filename: 'loadable-stats-dev.json',
      writeToDisk: true
    })
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

  module: {
    exprContextRegExp: /$^/,
    exprContextCritical: false,
    rules: [
      {
        test: /\.(png|woff|woff2|eot|ttf|jpg|jpeg|gif)$/,
        loader: 'url-loader?limit=100000', // or directly file-loader
        include: [
          path.resolve(__dirname, 'app'),
          path.resolve(__dirname, 'node_modules/react-native-vector-icons')
        ]
      },
      {
        test: /\.(js|svg)$/,
        include: [
          path.resolve(__dirname, 'index.web.js'),
          path.resolve(__dirname, 'app')
        ],

        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
              // This is a feature of `babel-loader` for Webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: true,
              plugins: ['react-hot-loader/babel']
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  }
};
