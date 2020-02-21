const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommunityFeedSchema = new Schema(
  {
    community: String,
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    // metaPost: { type: Schema.Types.ObjectId, ref: 'MetaPost' },
    rank: { type: Number, default: 0 },
    latestPost: { type: Date },
    tags: [{ type: String, ref: 'Tag' }],
    keywords: [String],
    categories: [{ type: String, ref: 'Tag' }]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: false
  }
);

CommunityFeedSchema.index({ community: 1 });
CommunityFeedSchema.index({ metaPost: 1 });
CommunityFeedSchema.index({ latestPost: 1 });
CommunityFeedSchema.index({ community: 1, rank: 1 });
CommunityFeedSchema.index({ community: 1, metaPost: 1 });
CommunityFeedSchema.index({ community: 1, latestPost: 1 });

CommunityFeedSchema.statics.updateDate = async function updateDate(_id, community, date) {
  const feedItem = await this.findOneAndUpdate(
    { post: _id, community },
    { latestPost: date },
    { new: true }
  );
  return feedItem;
};

CommunityFeedSchema.statics.addToFeed = async function addToFeed(post, community) {
  if (community === 'twitter') community = 'relevant';
  if (!community) throw new Error('missing community');
  await this.findOneAndUpdate(
    { community, post: post._id },
    {
      latestPost: post.data.latestComment || post.data.postDate,
      tags: post.tags,
      // categories: post.categories,
      rank: post.data.rank
    },
    { upsert: true, new: true }
  );
};

CommunityFeedSchema.statics.updateRank = async function updateRank(post, community) {
  if (!community) throw new Error('missing community');
  const feedItem = await this.findOne({ post: post._id, community });
  if (!feedItem) return null;
  // TODO - post rank should be tracked in a separate table
  // so that we are not grabbing stuff from a diff communities
  feedItem.rank = post.data.rank;
  feedItem.latestPost = post.data.latestComment || post.data.postDate;
  return feedItem.save();
};

CommunityFeedSchema.statics.removeFromCommunityFeed = async function removeFromCommunityFeed(
  _id,
  community
) {
  return this.deleteMany({ post: _id, community }).exec();
};

CommunityFeedSchema.statics.removeFromAllFeeds = async function removeFromFeed(_id) {
  return this.deleteMany({ post: _id }).exec();
};

module.exports = mongoose.model('CommunityFeed', CommunityFeedSchema);
