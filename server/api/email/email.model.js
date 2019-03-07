import mongoose from 'mongoose';

const { Schema } = mongoose;

const EmailSchema = new Schema({
  html: String,
  email: String,
  subject: String,
  campaign: String
});

module.exports = mongoose.model('Email', EmailSchema);
