/* eslint-disable no-console, no-use-before-define */
import Express from 'express';
import morgan from 'morgan';

let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let favicon = require('serve-favicon');
let MongoStore = require('connect-mongo')(session);

const app = new Express();
mongoose.Promise = global.Promise;

require('dotenv').config({ silent: true });

require('./queue');

console.log('NODE_ENV', process.env.NODE_ENV);

// -------------Dev server watch and hot reload---------------
let isDevelopment = (process.env.NODE_ENV !== 'production' &&
  process.env.NODE_ENV !== 'test' &&
  process.env.NODE_ENV !== 'native');
if (isDevelopment) {
  console.log('in development environment');
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
app.use(favicon(__dirname + '/../app/web/public/img/favicon.ico'));

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
  db: new MongoStore({
    db: mongoose.connection.db,
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
app.use(Express.static(__dirname + '/../app/web/public'));

let routes = require('./routes')(app);

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
    }
  });
  socketServer(server);
}

exports.app = app;
exports.server = server;
