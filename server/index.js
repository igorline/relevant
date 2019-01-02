if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}
delete process.env.BROWSER;
process.env.WEB = 'true';

require('@babel/register');
require('@babel/polyfill');
require('./server');
