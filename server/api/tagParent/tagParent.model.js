let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let TagparentSchema = new Schema({
  name: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Tagparent', TagparentSchema);
