let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let TagSchema = new Schema({
  _id: { type: String, trim: true },
  parents: [{ type: String, ref: 'Tag' }],
  categoryName: { type: String },
  category: { type: Boolean, index: true, default: false },
  count: { type: Number, default: 0 },
  // rank: { type: Number },
  active: { type: Boolean, default: true, index: true },
  emoji: String,
  children: [{ type: String, ref: 'Tag' }],
  main: [{ type: String, ref: 'Tag' }],
  communityId: { type: String, ref: 'Community' }
}, {
  timestamps: true
});

// TagSchema.pre('save', function(next) {
//   // TODO diff trending algo
//   let TENTH_LIFE = 24 * 60 * 60 * 1000;
//   let newRank = (this.createdAt.getTime() / TENTH_LIFE) + Math.log10(this.count + 1);
//   this.rank = newRank;
//   next();
// });

TagSchema.index({ rank: 1, createdAt: 1 });

module.exports = mongoose.model('Tag', TagSchema);

