/* eslint-disable no-console, no-use-before-define */
import Express from 'express';
import morgan from 'morgan';

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
let isDevelopment = (process.env.NODE_ENV !== 'production' &&
  process.env.NODE_ENV !== 'test' &&
  process.env.NODE_ENV !== 'native');

if (isDevelopment) {
  console.log('in development environment');
  // can test queue in development
  require('./queue');

  let webpack = require('webpack');
  let webpackDevMiddleware = require('webpack-dev-middleware');
  let webpackHotMiddleware = require('webpack-hot-middleware');
  let webpackConfig = require('../webpack.config');
  // Use this middleware to set up hot module reloading via webpack.
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
  }));
  app.use(webpackHotMiddleware(compiler));
}

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(favicon(path.join(__dirname, '/../app/web/public/img/favicon.ico')));

// Connect to db
require('./config/db.connect');

if (process.env.SEED_DB) {
  require('./config/seed');
}

// Persist sessions with MongoStore
// We need to enable sessions for passport twitter because its an oauth 1.0 strategy
app.use(session({
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
}));

function requireHTTPS(req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  return next();
}
app.use(requireHTTPS);

// public folder
app.use(Express.static(path.join(__dirname, '/../app/web/public')));
app.use(cookiesMiddleware());

let port = process.env.PORT || 3000;

console.log('WEB CONCURRENCY ', process.env.WEB_CONCURRENCY);

let server;
let socketServer = require('./socket').default;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, (error) => {
    if (error) {
      console.error(error);
    } else {
      console.info(`==> 🌎  Listening on port ${port}. Open up http://localhost:${port}/ in your browser.`);
      let now = new Date();
      require('./routes')(app);
      let time = (new Date()).getTime() - now.getTime();
      console.log('done loading routes', time / 1000, 's');
    }
  });
  socketServer(server, { pingTimeout: 30000 });
} else {
  require('./routes')(app);
}

require('./utils/updateDB-Community0.2.0');
require('./utils/ethereum').init();

exports.app = app;
exports.server = server;
