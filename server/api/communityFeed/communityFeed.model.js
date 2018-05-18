
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
      { _id, community },
      { latestPost: date },
      { new: true }
    );
    return feedItem;
  } catch (err) {
    console.log('error updating post date ', err);
    return null;
  }
};

CommunityFeedSchema.statics.updateRank = async function updateRank(_id, community) {
  try {
    let feedItem = await this.findOne({ metaPost: _id, community })
    .populate({
      path: 'metaPost',
      populate: [
        {
          path: 'commentary',
          match: { community },
          options: { sort: { rank: -1 }, limit: 1 },
        }
      ]
    });

    // create new feed item if needed
    if (!feedItem || !feedItem.metaPost) {
      if (community === 'twitter') community = 'relevant';
      let meta = this.model('MetaPost').findOne({ _id });
      feedItem = new CommunityFeed({
        metaPost: meta._id,
        community,
        latestPost: meta.latestPost,
        tags: meta.tags,
        categories: meta.categories,
        keywords: meta.keywords,
        rank: meta.rank,
      })
      feedItem = await feedItem.save();
    }

    let highestRank = feedItem.metaPost.commentary && feedItem.metaPost.commentary.length ?
      feedItem.metaPost.commentary[0].rank : 0;
    feedItem.rank = highestRank;
    feedItem = await feedItem.save();
    return feedItem;
  } catch (err) {
    console.log('error updating feedItem rank ', err);
    return null;
  }
};

module.exports = mongoose.model('CommunityFeed', CommunityFeedSchema);
