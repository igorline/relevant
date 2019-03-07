// if (process.env.NODE_ENV === 'production') {
//   require('newrelic');
// }
delete process.env.BROWSER;
process.env.WEB = 'true';
require('@babel/register');
require('@babel/polyfill');

require('dotenv').config({ silent: true });

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
require('./config/db.connect');

require('./utils/ethereum').init();

require('./queue');
