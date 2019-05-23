const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommunityMemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    embeddedUser: {
      _id: String,
      name: String,
      image: String,
      handle: String
    },
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' },
    community: String,
    superAdmin: { type: Boolean, default: false },
    role: { type: String, default: 'user' },
    reputation: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    invites: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

CommunityMemberSchema.index({ community: 1 });
CommunityMemberSchema.index({ communityId: 1 });
CommunityMemberSchema.index({ communityId: 1, user: 1 });
CommunityMemberSchema.index({ community: 1, user: 1 });

CommunityMemberSchema.index({ community: 1, reputation: -1 });
CommunityMemberSchema.index({ community: 1, reputation: -1, role: 1 });
CommunityMemberSchema.index({ community: 1, reputation: -1, user: 1 });

// TODO rep key to search by
CommunityMemberSchema.virtual('repKey').get(function getProfile() {
  return this.user + '_' + this.communityId;
});

export default mongoose.model('CommunityMember', CommunityMemberSchema);
