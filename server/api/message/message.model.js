'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../user/user.model');

var MessageSchema = new Schema({
  to: { type: String, ref: 'User' },
  from: { type: String, ref: 'User' },
  tag: { type: String, ref: 'Tag' },
  text: String,
  type: String,
  read: {type: Boolean, default: false}
}, {
  timestamps: true
});

MessageSchema.index({ to: 1 });

// MessageSchema.pre('init', function(doc) {
//   doc.read = true;
//   doc.save();
// });


module.exports = mongoose.model('Message', MessageSchema);
