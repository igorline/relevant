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
    invites: { type: Number, default: 0 },
    degree: { type: Number, default: 0 },
    postDegree: { type: Number, default: 0 },
    pagerank: { type: Number, default: 0 },
    pagerankNeg: { type: Number, default: 0 },
    pagerankRaw: { type: Number, default: 0 },
    pagerankRawNeg: { type: Number, default: 0 },
    unread: { type: Number, default: 0 },
    deletedCommunity: { type: Boolean, default: false },
    customAdminWeight: { type: Number },
    defaultWeight: { type: Number },

    totalUsers: Number,
    level: Number,
    percentRank: Number,
    relevanceRecord: [
      {
        relevance: Number,
        time: Date
      }
    ]
  },
  {
    timestamps: true
  }
);

CommunityMemberSchema.index({ community: 1 });
CommunityMemberSchema.index({ communityId: 1 });
CommunityMemberSchema.index({ deletedCommunity: 1 });

CommunityMemberSchema.index({ communityId: 1, deletedCommunity: 1 });
CommunityMemberSchema.index({ communityId: 1, user: 1 });
CommunityMemberSchema.index({ community: 1, user: 1 });

CommunityMemberSchema.index({ community: 1, reputation: -1 });
CommunityMemberSchema.index({ community: 1, reputation: -1, role: 1 });
CommunityMemberSchema.index({ community: 1, reputation: -1, user: 1 });

CommunityMemberSchema.index({ deletedCommunity: 1, user: 1 });

// TODO rep key to search by
CommunityMemberSchema.virtual('repKey').get(function getProfile() {
  return this.user + '_' + this.communityId;
});

// update user relevance and save record
CommunityMemberSchema.methods.updateRelevanceRecord = function updateRelevanceRecord() {
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

export default mongoose.model('CommunityMember', CommunityMemberSchema);
