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
  twitter: { type: Boolean, default: false },
  feedRelevance: Number,
  twitterUrl: String,
}, {
  timestamps: true,
});

MetaPostSchema.index({ lastTwitterUpdate: 1 });
MetaPostSchema.index({ twitterurl: 1 });

MetaPostSchema.index({ twitter: 1 });
MetaPostSchema.index({ url: 1 });
MetaPostSchema.index({ rank: 1 });
MetaPostSchema.index({ twitter: 1 });
MetaPostSchema.index({ latestPost: 1 });
MetaPostSchema.index({ latestPost: 1, tags: 1 });
MetaPostSchema.index({ rank: 1, tags: 1 });

MetaPostSchema.pre('remove', async function remove(next) {
  try {
    await this.model('CommunityFeed').find({ metaPost: this._id }).remove();
    next();
  } catch (err) {
    console.log('error removing community feed', err);
  }
});

MetaPostSchema.statics.updateRank = async function updateRank(_id, twitter) {
  try {
    let meta = await this.findOne({ _id })
    .populate({
      path: 'commentary',
      options: { sort: { rank: -1 }, limit: 1 },
    });
    if (!meta) throw new Error('no meta post found');
    let highestRank = meta.commentary && meta.commentary.length ? meta.commentary[0].rank : 0;
    if (!meta.commentary || !meta.commentary.length) {
      // console.log(meta);
    }

    if (twitter && meta.twitter) {
      meta.twitter = false;
      meta.latestPost = new Date();
      // twitter integration is only supported in relevant
      // let community = 'relevant';
      // let feedItem = await this.model('CommunityFeed').findOneAndUpdate(
      //   { community, metaPost: meta._id },
      //   {
      //     latestPost: meta.latestPost,
      //     tags: meta.tags,
      //     categories: meta.categories,
      //     keywords: meta.keywords,
      //     rank: meta.rank,
      //   },
      //   { upsert: true, new: true }
      // );
    }

    meta.rank = highestRank;
    meta = await meta.save();
    console.log('updated meta rank ', meta.rank);
    return meta;
  } catch (err) {
    console.log('error updating meta rank ', err);
    return null;
  }
};

MetaPostSchema.methods.pruneCommunityFeed = async function pruneCommunityFeed(community) {
  try {
    let meta = await this.model('MetaPost').findOne({ _id: this._id })
    .populate({
      path: 'commentary',
      match: { community },
    });
    if (!meta.commentary.length) {
      await this.model('CommunityFeed')
      .findOne({ metaPost: this._id, community })
      .remove();
    }
    return;
  } catch (err) {
    console.log(err);
  }
};

module.exports = mongoose.model('MetaPost', MetaPostSchema);

