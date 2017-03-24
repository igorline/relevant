import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let ListSchema = new Schema({
  email: { type: String, index: { unique: true } },
  status: { type: String, default: 'waitlist' }
}, {
  timestamps: true
});

ListSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('List', ListSchema);
