const mongoose = require('mongoose');

const db = mongoose.connection;

const config = {
  socketTimeoutMS: 0,
  keepAlive: 120,
  reconnectTries: 30,
  useMongoClient: true,
};

function connectWithRetry() {
  mongoose.connect(process.env.MONGO_URI, config)
  .catch(err => {
    console.log('catch ', err);
    console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
    setTimeout(connectWithRetry, 5000);
  });
}
connectWithRetry();

db.on('connecting', () => {
  console.log('connecting to MongoDB...');
});

db.on('error', (error) => {
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
// TEST DONT'T NEED THIS ANYMORE?
// db.on('disconnected', () => {
//   console.log('MongoDB disconnected!');
//   mongoose.connect(process.env.MONGO_URI, config);
// });


module.exports = {};
