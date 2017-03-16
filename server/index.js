delete process.env.BROWSER;
process.env.WEB = 1;
require('babel-core/register');
require('./server');
