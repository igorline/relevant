const mongoose = require('mongoose');

const db = mongoose.connection;

const config = {
  socketTimeoutMS: 0,
  keepAlive: 120,
  reconnectTries: 30,
  useMongoClient: true,
};

mongoose.connect(process.env.MONGO_URI, config);

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
