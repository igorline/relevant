let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let CommunityMemberSchema = new Schema({
  user: { type: String, ref: 'User', index: true },
  communityId: { type: Schema.Types.ObjectId, ref: 'Community' },
  community: String,
  role: { type: String, default: 'user' },
  reputation: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model('CommunityMembers', CommunityMemberSchema);
