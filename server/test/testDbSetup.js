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
  useFindAndModify: false
};

process.env.SESSION_SECRET = 'test-secret';
process.env.TWITTER_ID = 'test-twitter-id';
process.env.TWITTER_SECRET = 'test-twitter-secret';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(`${global.MONGO_URI}${process.env.TEST_SUITE}`, mongooseOpts);
  }
  await clearDB();
  return setupTestData();

  async function clearDB() {
    if (mongoose.connection.host !== '127.0.0.1') {
      throw new Error('this is not a test db!');
    }
    const clear = Object.keys(mongoose.connection.collections).map(i =>
      mongoose.connection.collections[i].remove()
    );
    return Promise.all(clear);
  }
});

afterAll(async () => mongoose.disconnect());
