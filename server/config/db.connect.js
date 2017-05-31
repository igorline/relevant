'use strict';

var mongoose = require('mongoose');

var db = mongoose.connection;

var db_config = {
  server: {
    auto_reconnect: true
  }
};

db.on('connecting', function() {
  console.log('connecting to MongoDB...');
});

db.on('error', function(error) {
  console.error('Error in MongoDb connection: ' + error);
  mongoose.disconnect();
});
db.on('connected', function() {
  console.log('MongoDB connected!');
});
db.once('open', function() {
  console.log('MongoDB connection opened!');
});
db.on('reconnected', function() {
  console.log('MongoDB reconnected!');
});
db.on('disconnected', function() {
  console.log('MongoDB disconnected!');
  // mongoose.connect(process.env.MONGO_URI, db_config);
});
mongoose.connect(process.env.MONGO_URI, db_config);

module.exports = {};
