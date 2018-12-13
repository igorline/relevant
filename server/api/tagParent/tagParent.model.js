const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TagparentSchema = new Schema({
  name: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Tagparent', TagparentSchema);
