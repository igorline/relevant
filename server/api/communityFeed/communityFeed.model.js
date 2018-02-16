
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
CommunityFeedSchema.index({ community: 1, rank: 1 });
CommunityFeedSchema.index({ community: 1, metaPost: 1 });
CommunityFeedSchema.index({ community: 1, latestPost: 1 });
// CommunityFeedSchema.index({ comminity: 1, rank: 1, metaPost: 1 });

CommunityFeedSchema.statics.updateDate = async function (_id, community, date) {
  try {
    let feedItem = await this.findOneAndUpdate(
      { _id, community },
      { latestPost: date },
      { new: true }
    );
    return feedItem;
  } catch (err) {
    console.log('error updating post date ', err);
  }
};

CommunityFeedSchema.statics.updateRank = async function (_id, community) {
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
    if (!feedItem || !feedItem.metaPost) throw new Error('no feed item found');
    let highestRank = feedItem.metaPost.commentary && feedItem.metaPost.commentary.length ?
      feedItem.metaPost.commentary[0].rank : 0;
    feedItem.rank = highestRank;
    feedItem = await feedItem.save();
    return feedItem;
  } catch (err) {
    console.log('error updating feedItem rank ', err);
  }
};

module.exports = mongoose.model('CommunityFeed', CommunityFeedSchema);
