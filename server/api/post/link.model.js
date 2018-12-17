const mongoose = require('mongoose');

const { Schema } = mongoose;

// TODO check for unused fields
const MetaPostSchema = new Schema(
  {
    title: String,
    description: String,
    image: String,
    url: { type: String, index: true },

    shortText: { type: String },
    longText: { type: String },
    articleDate: Date,
    articleAuthor: [String],
    copyright: String,
    links: [
      {
        text: String,
        href: String
      }
    ],
    publisher: String,
    domain: String,
    keywords: [String],

    tags: [{ type: String, ref: 'Tag' }],
    // DEPRECATED?
    categories: [{ type: String, ref: 'Tag' }],

    flagged: { type: Boolean, default: false },
    flaggedBy: [{ type: String, ref: 'User', select: false }],
    flaggedTime: Date
  },
  {
    timestamps: true
  }
);

MetaPostSchema.index({ url: 1 });
MetaPostSchema.index({ rank: 1 });
MetaPostSchema.index({ latestPost: 1 });
MetaPostSchema.index({ latestPost: 1, tags: 1 });
MetaPostSchema.index({ rank: 1, tags: 1 });

module.exports = mongoose.model('MetaPost', MetaPostSchema);
