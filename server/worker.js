// if (process.env.NODE_ENV === 'production') {
//   require('newrelic');
// }
delete process.env.BROWSER;
process.env.WEB = 'true';
require('babel-core/register');
require('babel-polyfill');

require('dotenv').config({ silent: true });
// console.log(process.env.MONGO_URI)

require('./queue');

setInterval(() => console.log('test'), 1000);