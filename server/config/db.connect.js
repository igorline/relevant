/* eslint no-console: 0 */
const mongoose = require('mongoose');

const db = mongoose.connection;

const config = {
  socketTimeoutMS: 30000,
  keepAlive: 1,
  reconnectTries: 30,
  useMongoClient: true
};

function connectWithRetry() {
  return mongoose
  .connect(
    process.env.MONGO_URI,
    config
  )
  .catch(err => {
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
  console.log('MongoDB connected!');
});
db.once('open', () => {
  console.log('MongoDB connection opened!');
});
db.on('reconnected', () => {
  console.log('MongoDB reconnected!');
});

module.exports = {
  db: connectWithRetry()
};
