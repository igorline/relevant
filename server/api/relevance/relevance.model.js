import mongoose from 'mongoose';
import Tag from '../tag/tag.model';

let Schema = mongoose.Schema;

let RelevanceSchema = new Schema({
  user: { type: String, ref: 'User', index: true },
  tag: { type: String, ref: 'Tag' },
  topTopic: { type: Boolean, deafault: false },
  category: { type: String, ref: 'Tag' },
  relevance: { type: Number, default: 0 }
}, {
  timestamps: true
});

RelevanceSchema.index({ user: 1, relevance: 1 });

RelevanceSchema.statics.updateUserRelevance = async function (user, post, relevanceToAdd) {
  let tagRelevance;
  try {
    let cats = await Tag.find({ category: true });
    let tagsAndCat = [...new Set([...post.tags, post.category])];
    tagRelevance = tagsAndCat.map(tag => {
      let index = cats.findIndex(cat => {
        if (cat._id === tag) return true;
        else if (cat.main.findIndex(main => tag === main._id) > -1) {
          return true;
        }
        return false;
      });
      let topTopic = { topTopic: index > -1 };
      return this.update(
        { user, tag },
        { $inc: { relevance: relevanceToAdd }, topTopic },
        { upsert: true },
      ).exec();
    });

    tagRelevance.push(
      this.update(
        { user, category: post.category },
        { $inc: { relevance: relevanceToAdd } },
        { upsert: true },
      ).exec());
  } catch (err) {
    console.log('relevance error ', err);
    return null;
  }
  return Promise.all(tagRelevance);
};

module.exports = mongoose.model('Relevance', RelevanceSchema);
