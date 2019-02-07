import Post from 'server/api/post/post.model'; // eslint-disable-line

const mongoose = require('mongoose');

const mongooseOpts = {
  // options for mongoose 4.11.3 and above
  autoReconnect: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000,
  useMongoClient: true // remove this line if you use mongoose 5 and above
};

beforeEach(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      `${global.MONGO_URI}${process.env.TEST_SUITE}`,
      mongooseOpts
    );
    return clearDB();
  }
  return clearDB();

  async function clearDB() {
    const clear = Object.keys(mongoose.connection.collections).map(i =>
      mongoose.connection.collections[i].remove()
    );
    return Promise.all(clear);
  }
});

afterEach(async () => mongoose.disconnect());
