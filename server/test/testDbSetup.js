import { setupTestData } from './seedData';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const mongooseOpts = {
  // options for mongoose 4.11.3 and above
  autoReconnect: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000,
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
};

beforeAll(async () => {
  if (!process.env.TEST_SUITE) {
    // eslint-disable-next-line
    console.warn(
      'MISSING TEST_SUITE NAME - you need to set a process.env.TEST_SUITE variable in your test file'
    );
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(`${global.MONGO_URI}${process.env.TEST_SUITE}`, mongooseOpts);
  }
  await clearDB();
  return setupTestData();

  async function clearDB() {
    if (mongoose.connection.host !== '127.0.0.1') {
      throw new Error('this is not a test db!');
    }
    const clear = Object.values(mongoose.connection.collections).map(async collection =>
      collection.deleteMany()
    );
    await Promise.all(clear);
  }
});

afterAll(async () => mongoose.disconnect());
