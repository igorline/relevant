if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}
delete process.env.BROWSER;
process.env.WEB = 'true';
require('babel-core/register');
require('./server');
