import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let InviteSchema = new Schema({
  email: { type: String },
  name: { type: String },
  code: { type: String, index: true },
  redeemed: { type: Boolean, default: false },
  status: { type: String },
  invitedBy: { type: String, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invite', InviteSchema);
