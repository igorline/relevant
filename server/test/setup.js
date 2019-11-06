const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongoTestConfigPath = path.join(__dirname, './mongoTestConfig.json');

process.env.WEB = 'true';
delete process.env.BROWSER;

process.env.SESSION_SECRET = 'test-secret';
process.env.TWITTER_ID = 'test-twitter-id';
process.env.TWITTER_SECRET = 'test-twitter-secret';

const mongod = new MongoMemoryServer({
  autoStart: false
});

module.exports = async () => {
  if (!mongod.isRunning) {
    await mongod.start();
  }

  const mongoUri = await mongod.getConnectionString();
  fs.writeFileSync(
    mongoTestConfigPath,
    JSON.stringify({ mongoUri: mongoUri.replace('?', '') })
  );

  // Set reference to mongod in order to close the server during teardown.
  global.__MONGOD__ = mongod;
};
