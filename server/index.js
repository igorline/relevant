if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}
delete process.env.BROWSER;
process.env.WEB = 'true';

require('@babel/register');
require('@babel/polyfill');
require('./server');

// prevents require images
require.extensions['.png'] = () => {};
require.extensions['.jpg'] = () => {};
require.extensions['.jpeg'] = () => {};
require.extensions['.gif'] = () => {};
