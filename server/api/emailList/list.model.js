import mongoose from 'mongoose';

const { Schema } = mongoose;

const ListSchema = new Schema(
  {
    email: { type: String },
    name: { type: String },
    status: { type: String, default: 'waitlist' }
  },
  {
    timestamps: true
  }
);

ListSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('List', ListSchema);
