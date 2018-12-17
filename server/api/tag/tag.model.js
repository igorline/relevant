const mongoose = require('mongoose');

const { Schema } = mongoose;

const TagSchema = new Schema(
  {
    _id: { type: String, trim: true },
    parents: [{ type: String, ref: 'Tag' }],
    categoryName: { type: String },
    category: { type: Boolean, index: true, default: false },
    count: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    emoji: String,
    children: [{ type: String, ref: 'Tag' }],
    main: [{ type: String, ref: 'Tag' }],
    communityId: { type: String, ref: 'Community' }
  },
  {
    timestamps: true
  }
);

TagSchema.index({ rank: 1, createdAt: 1 });

module.exports = mongoose.model('Tag', TagSchema);
