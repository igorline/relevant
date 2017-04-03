let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let MetaPostSchema = new Schema({
  title: String,
  description: String,
  image: String,
  url: { type: String, index: true },

  shortText: { type: String },
  longText: { type: String },
  articleDate: Date,
  articleAuthor: [String],
  copyright: String,
  links: [{
    text: String,
    href: String,
  }],
  publisher: String,
  domain: String,

  tags: [{ type: String, ref: 'Tag' }],
  categories: [{ type: String, ref: 'Tag' }],
  rank: { type: Number, default: 0, index: true },
  topCommentary: { type: Schema.Types.ObjectId, ref: 'Post' },
  newCommentary: { type: Schema.Types.ObjectId, ref: 'Post' },
  commentary: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  commentaryCount: { type: Number, default: 0 },
  latestPost: { type: Date, index: true },
}, {
  timestamps: true,
});

MetaPostSchema.index({ url: 1 });
MetaPostSchema.index({ rank: 1 });
MetaPostSchema.index({ createdAt: 1 });
MetaPostSchema.index({ createdAt: 1, tags: 1 });
MetaPostSchema.index({ rank: 1, tags: 1 });

module.exports = mongoose.model('MetaPost', MetaPostSchema);
