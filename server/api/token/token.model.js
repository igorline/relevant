const mongoose = require('mongoose');

const { Schema } = mongoose;

const AuthTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    revokeBefore: Number
  },
  {
    timestamps: true
  }
);

AuthTokenSchema.statics.revoke = async function revoke(_id) {
  const now = new Date();
  const revokeBefore = Math.floor(now.getTime() / 1000);
  const revokeToken = new this({ user: _id, revokeBefore });
  return revokeToken.save();
};

AuthTokenSchema.statics.checkRevoked = async function checkRevoked({ _id, iat }) {
  return this.findOne({ user: _id, revokeBefore: { $gte: iat } });
};

module.exports = mongoose.model('AuthToken', AuthTokenSchema);
