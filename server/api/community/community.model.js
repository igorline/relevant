import { NAME_PATTERN } from '../../../app/utils/text';
let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let CommunitySchema = new Schema({
  name: String,
  slug: { type: String, unique: true, required: true },
  description: String,
  channels: [{ type: String }],
  topics: [{ type: String, ref: 'Tags' }],
  image: String
}, {
  timestamps: true
});

CommunitySchema.index({ slug: 1 });

// Validate _id
CommunitySchema
.path('slug')
.validate(
  slug => NAME_PATTERN.test(slug),
  'Username can only contain letters, numbers, dashes and underscores'
);

CommunitySchema.pre('remove', async function remove(next) {
  try {
    await this.model('CommunityMembers').find({ community: this.slug }).remove().exec();
    next();
  } catch (err) { throw err; }
});

export default mongoose.model('Community', CommunitySchema);
