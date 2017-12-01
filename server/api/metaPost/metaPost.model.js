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
  keywords: [String],

  tags: [{ type: String, ref: 'Tag' }],
  categories: [{ type: String, ref: 'Tag' }],
  rank: { type: Number, default: 0, index: true },
  topCommentary: { type: Schema.Types.ObjectId, ref: 'Post' },
  newCommentary: { type: Schema.Types.ObjectId, ref: 'Post' },

  // May get big
  commentary: [{ type: Schema.Types.ObjectId, ref: 'Post' }],

  commentaryCount: { type: Number, default: 0 },
  latestPost: { type: Date, index: true },

  flagged: { type: Boolean, default: false },
  flaggedBy: [{ type: String, ref: 'User', select: false }],
  flaggedTime: Date,

  twitterCommentary: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  twitterScore: { type: Number, default: 0 },
  tweetCount: { type: Number, default: 0 },
  // TODO this could get big - should be separate table
  seenInFeedNumber: { type: Number, default: 0 },
  latestTweet: Date,

}, {
  timestamps: true,
});

MetaPostSchema.index({ url: 1 });
MetaPostSchema.index({ rank: 1 });
MetaPostSchema.index({ latestPost: 1 });
MetaPostSchema.index({ latestPost: 1 });
MetaPostSchema.index({ latestPost: 1, tags: 1 });
MetaPostSchema.index({ rank: 1, tags: 1 });

MetaPostSchema.statics.updateRank = async function (_id) {
  let meta;
  try {
    meta = await this.findOne({ _id })
    .populate({
      path: 'commentary',
      options: { sort: { rank: -1 }, limit: 1 },
    });
    if (!meta) throw new Error('no meta post found');
    let highestRank = meta.commentary && meta.commentary.length ? meta.commentary[0].rank : 0;
    if (!meta.commentary || !meta.commentary.length) {
      // console.log(meta);
    }
    meta.rank = highestRank;
    meta = await meta.save();
    console.log('updated meta rank ', meta.rank);
  } catch (err) {
    console.log('error updating meta rank ', err);
  }
  return meta;
};


module.exports = mongoose.model('MetaPost', MetaPostSchema);

