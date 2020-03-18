import { setupTestData } from 'server/test/seedData';
import computePageRank from 'server/pagerank/pagerankCompute';
import Community from 'server/api/community/community.model';

const SEED_DB = process.env.SEED_DB === 'true' && process.env.NODE_ENV !== 'production';
/* eslint no-console: 0 */
const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);

const db = mongoose.connection;

const config = {
  socketTimeoutMS: 30000,
  keepAlive: 1,
  reconnectTries: 30,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
};

function connectWithRetry() {
  return mongoose.connect(process.env.MONGO_URI, config).catch(err => {
    console.log('catch ', err);
    console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
    setTimeout(connectWithRetry, 5000);
  });
}

db.on('connecting', () => {
  console.log('connecting to MongoDB...');
});

db.on('error', error => {
  console.error('Error in MongoDb connection: ' + error);
  mongoose.disconnect();
});
db.on('connected', () => {
  console.log('MongoDB connected!', mongoose.connection.host);
  if (SEED_DB && mongoose.connection.host === 'localhost') {
    seedDb();
  }
});
db.once('open', () => {
  console.log('MongoDB connection opened!');
});
db.on('reconnected', () => {
  console.log('MongoDB reconnected!');
});

async function seedDb() {
  if (!SEED_DB || mongoose.connection.host !== 'localhost') {
    throw new Error('should not seed db');
  }
  console.log('SEEDING DB');
  const clear = Object.keys(mongoose.connection.collections).map(async i => {
    // await mongoose.connection.collections[i].dropIndexes();
    return mongoose.connection.collections[i].deleteMany();
  });
  await Promise.all(clear);
  await setupTestData();
  const communities = await Community.find({});
  const pagerank = communities.forEach(c =>
    computePageRank({ communityId: c._id, community: c.slug })
  );
  await Promise.all(pagerank);
}

module.exports = {
  db: connectWithRetry()
};
