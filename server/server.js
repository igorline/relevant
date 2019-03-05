/* eslint-disable no-console, no-use-before-define */
import Express from 'express';
import morgan from 'morgan';
import passport from 'passport';

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const favicon = require('serve-favicon');
const MongoStore = require('connect-mongo')(session);
const cookiesMiddleware = require('universal-cookie-express');
const path = require('path');

const app = new Express();
mongoose.Promise = global.Promise;

require('dotenv').config({ silent: true });

console.log('NODE_ENV', process.env.NODE_ENV);

require('events').EventEmitter.prototype._maxListeners = 100;

// -------------Dev server watch and hot reload---------------
const isDevelopment =
  process.env.NODE_ENV !== 'production' &&
  process.env.NODE_ENV !== 'test' &&
  process.env.NODE_ENV !== 'native';

const relevantEnv = process.env.RELEVANT_ENV;

if (isDevelopment) {
  console.log('in development environment');
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackConfig = require('../webpack.config');
  // Use this middleware to set up hot module reloading via webpack.
  const compiler = webpack(webpackConfig);
  app.use(
    webpackDevMiddleware(compiler, {
      // noInfo: true,
      publicPath: webpackConfig.output.publicPath
      // writeToDisk: filePath => /loadable-stats-dev\.json$/.test(filePath)
    })
  );
  app.use(webpackHotMiddleware(compiler));
}

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(favicon(path.join(__dirname, '/../app/public/img/favicon.ico')));

// Connect to db
const { db } = require('./config/db.connect');

// Persist sessions with MongoStore
// We need to enable sessions for passport twitter because its an oauth 1.0 strategy
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      autoRemove: 'interval',
      autoRemoveInterval: 10, // In minutes. Default
      touchAfter: 24 * 3600, // time period in seconds
      clear_interval: 3600
    })
  })
);

app.use(passport.initialize());
app.use(passport.session());

function requireHTTPS(req, res, next) {
  if (
    req.headers['x-forwarded-proto'] !== 'https' &&
    process.env.NODE_ENV === 'production'
  ) {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  return next();
}

if (process.env.NO_SSL !== 'true') {
  app.use(requireHTTPS);
}

// public folder
app.use(Express.static(path.join(__dirname, '/../app/public')));
app.use(cookiesMiddleware());

const port = process.env.PORT || 3000;

console.log('WEB CONCURRENCY ', process.env.WEB_CONCURRENCY);
let server;
const socketServer = require('./socket').default;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, error => {
    if (error) {
      console.error(error);
    } else {
      console.info(
        `==> 🌎  Listening on port ${port}. Open up http://localhost:${port}/ in your browser.`
      );
      const now = new Date();
      require('./routes')(app);
      const time = new Date().getTime() - now.getTime();
      console.log('done loading routes', time / 1000, 's');
    }
    socketServer(server, { pingTimeout: 30000 });
  });
} else {
  require('./routes')(app);
}

// in production this is a worker
if (relevantEnv === 'staging' || isDevelopment) {
  require('./queue');
}

require('./utils/updateDB-Community0.3.0');
require('./utils/ethereum').init();

exports.app = app;
exports.server = server;
exports.db = db;
