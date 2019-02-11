const mongoose = require('mongoose');

const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    to: { type: Schema.Types.Mixed, ref: 'User' },
    from: { type: Schema.Types.Mixed, ref: 'User' },
    tag: { type: String, ref: 'Tag' },
    text: String,
    type: String,
    read: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

MessageSchema.index({ to: 1 });

module.exports = mongoose.model('Message', MessageSchema);
