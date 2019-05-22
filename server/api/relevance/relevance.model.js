import mongoose from 'mongoose';
import Tag from '../tag/tag.model';

const { Schema } = mongoose;

// TODO move this to Community Member
const RelevanceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    tag: { type: String, ref: 'Tag' },
    global: { type: Boolean, default: false },
    topTopic: { type: Boolean, deafault: false },

    community: { type: String },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' },

    category: { type: String, ref: 'Tag' },
    relevance: { type: Number, default: 0 },

    pagerank: { type: Number, default: 0 },
    pagerankRaw: { type: Number, default: 0 },

    rank: Number,
    totalUsers: Number,
    level: Number,
    percentRank: Number,
    relevanceRecord: [
      {
        relevance: Number,
        time: Date
      }
    ],
    topTopics: [{ type: String, ref: 'Tag' }],
    invites: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

RelevanceSchema.index({ user: 1, relevance: 1 });
RelevanceSchema.index({ user: 1, communityId: 1 });
RelevanceSchema.index({ user: 1, communityId: 1, global: 1 });
RelevanceSchema.index({ user: 1, community: 1, global: 1 });

// update user relevance and save record
RelevanceSchema.methods.updateRelevanceRecord = function updateRelevanceRecord() {
  let { relevanceRecord } = this;
  if (!relevanceRecord) relevanceRecord = [];
  relevanceRecord.unshift({
    time: new Date(),
    relevance: this.pagerank
  });
  relevanceRecord = this.relevanceRecord.slice(0, 10);
  this.relevanceRecord = relevanceRecord;
  return this;
};

RelevanceSchema.statics.create = async function create({
  userId,
  community,
  communityId
}) {
  try {
    return this.model('Relevance').findOneAndUpdate(
      { user: userId, communityId, global: true },
      { community },
      { upsert: true }
    );
  } catch (err) {
    throw err;
  }
};

// DEPRECATED
RelevanceSchema.statics.updateUserRelevance = async function updateUserRelevance(
  user,
  post,
  relevanceToAdd,
  communityId
) {
  let tagRelevance;
  // TODO await?
  // TODO right now we are updating reputation based on post community
  // but we can also do it based on voter's diff community reputations!
  try {
    // let community = post.community;
    const cats = await Tag.find({ category: true });
    const tagsAndCat = [...new Set([...post.tags, post.category])];
    tagRelevance = tagsAndCat.map(tag => {
      const index = cats.findIndex(cat => {
        if (cat._id === tag) return true;
        // Depricated - no more main
        if (cat.main.findIndex(main => tag === main._id) > -1) {
          return true;
        }

        return false;
      });
      const topTopic = { topTopic: index > -1 };
      return this.update(
        { user, tag, communityId },
        { $inc: { relevance: relevanceToAdd }, topTopic },
        { upsert: true }
      ).exec();
    });

    // update category reputation
    tagRelevance.push(
      this.update(
        { user, category: post.category, communityId },
        { $inc: { relevance: relevanceToAdd } },
        { upsert: true }
      ).exec()
    );

    // update global reputation
    const relevance = await this.findOneAndUpdate(
      { user, communityId, global: true },
      { $inc: { relevance: relevanceToAdd } },
      { upsert: true, new: true }
    );

    // return Promise.all(tagRelevance);
    return relevance;
  } catch (err) {
    throw err;
  }
};

RelevanceSchema.statics.mergeDuplicates = async function mergeDuplicates() {
  try {
    const rel = await this.find({});
    rel.forEach((rel1, i) => {
      rel.forEach((rel2, j) => {
        if (i <= j) return false;
        if (rel1.tag && rel2.tag === rel1.tag && rel1.user === rel2.user) {
          rel1.relevance = Math.max(rel1.relevance, rel2.relevance);
          rel1.save();
          rel2.remove();
          return true;
        }
        return false;
      });
    });
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model('Relevance', RelevanceSchema);
