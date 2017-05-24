import mongoose from 'mongoose';

let Schema = mongoose.Schema;

let EmailSchema = new Schema({
  html: String,
  email: String,
  subject: String,
  campaign: String,
});

module.exports = mongoose.model('Email', EmailSchema);

