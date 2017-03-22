delete process.env.BROWSER;
process.env.WEB = 'true';
require('babel-core/register');
require('./server');
