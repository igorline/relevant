
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let CommunityFeedSchema = new Schema({
  community: String,
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  metaPost: { type: Schema.Types.ObjectId, ref: 'MetaPost' },
  rank: { type: Number, default: 0 },
  latestPost: { type: Date },
  tags: [{ type: String, ref: 'Tag' }],
  keywords: [String],
  categories: [{ type: String, ref: 'Tag' }],
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: false
});

CommunityFeedSchema.index({ community: 1 });
CommunityFeedSchema.index({ metaPost: 1 });
CommunityFeedSchema.index({ latestPost: 1 });
CommunityFeedSchema.index({ community: 1, rank: 1 });
CommunityFeedSchema.index({ community: 1, metaPost: 1 });
CommunityFeedSchema.index({ community: 1, latestPost: 1 });
// CommunityFeedSchema.index({ comminity: 1, rank: 1, metaPost: 1 });

CommunityFeedSchema.statics.updateDate = async function updateDate(_id, community, date) {
  try {
    let feedItem = await this.findOneAndUpdate(
      { post: _id, community },
      { latestPost: date },
      { new: true }
    );
    return feedItem;
  } catch (err) {
    console.log('error updating post date ', err);
    return null;
  }
};

CommunityFeedSchema.statics.updateRank = async function updateRank(post, community, rank) {
  try {
    let feedItem = await this.findOne({ post: post._id, community });

    // create new feed item if needed (this is for twitter feed)
    if (!feedItem) {
      if (community === 'twitter') community = 'relevant';
      feedItem = new this({
        post: post._id,
        community,
        latestPost: post.data.latestComment,
        tags: post.tags,
        categories: post.categories,
        // not used
        // keywords: post.keywords,
        rank,
      });
      return await feedItem.save();
    }

    // TODO - post rank should be tracked in a separate table so that we are not grabbing stuff from a diff communities
    feedItem.rank = rank;
    feedItem.latestPost = post.data.latestComment;
    return await feedItem.save();
  } catch (err) {
    console.log('error updating feedItem rank ', err);
    return null;
  }
};


CommunityFeedSchema.statics.removeFromCommunityFeed =
async function removeFromCommunityFeed(_id, community) {
  try {
    return await this.remove({ post: _id, community });
  } catch (err) {
    console.log(err);
    return null;
  }
};

CommunityFeedSchema.statics.removeFromAllFeeds = async function removeFromFeed(_id) {
  try {
    return await this.remove({ post: _id });
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = mongoose.model('CommunityFeed', CommunityFeedSchema);
