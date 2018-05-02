const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'cheap-eval-source-map',
  entry: {
    app: [
      './index.webNew.js',
      'whatwg-fetch',
      'webpack-hot-middleware/client?quiet=true'
    ]
  },
  output: {
    path: path.join(__dirname, '/app/web/public'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  mode: 'development',
  // optimization: {
  //   splitChunks: {
  //     chunks: "all"
  //   }
  // },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        BROWSER: JSON.stringify(true),
        DEVTOOLS: JSON.stringify(true),  // <-------- DISABLE redux-devtools HERE
        NODE_ENV: JSON.stringify('development'),
        WEB: JSON.stringify('true'),
        API_SERVER: JSON.stringify('')
      }
    })
  ],
  resolve: {
    symlinks: false,
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom')
    }
  },

  module: {
    exprContextRegExp: /$^/,
    exprContextCritical: false,
    rules: [
      {
        test: /\.svg$/,
        loader: 'raw-loader'
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
          options: {
            babelrc: true,
            // This is a feature of `babel-loader` for Webpack (not Babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: true,
            plugins: ['react-hot-loader/babel'],
          },
        }],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
};

