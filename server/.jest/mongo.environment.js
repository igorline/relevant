const NodeEnvironment = require('jest-environment-node');
const path = require('path');
const fs = require('fs');
const mongoTestConfigPath = path.join(__dirname, '../.jest/mongoTestConfig.json');

class MongoEnvironment extends NodeEnvironment {
  constructor(config) {
    // eslint-disable-line
    super(config);
  }

  async setup() {
    const mongoTestConfig = JSON.parse(fs.readFileSync(mongoTestConfigPath, 'utf-8'));
    this.global.MONGO_URI = mongoTestConfig.mongoUri;
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = MongoEnvironment;
