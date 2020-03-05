import mongoose from 'mongoose';
import { NAME_PATTERN } from 'app/utils/text';
import socketEvent from 'server/socket/socketEvent';

const { Schema } = mongoose;

const CommunitySchema = new Schema(
  {
    name: String,
    slug: { type: String, unique: true, required: true },
    description: String,
    channels: [{ type: String }],
    topics: [{ type: String, ref: 'Tags' }],
    image: String,
    currentPosts: { type: Number, default: 0 },

    rewardFund: { type: Number, default: 0 },
    currentShares: { type: Number, default: 0 },
    topPostShares: { type: Number, default: 0 },

    postCount: { type: Number, default: 0 },
    lastRewardFundUpdate: { type: Date, default: new Date() },

    // TODO - start using this for twitter?
    avgTwitterScore: { type: Number, default: 0 },
    twitterCount: { type: Number, default: 0 },
    lastTwitterUpdate: { type: Date },
    maxUserRank: { type: Number },
    maxPostRank: { type: Number },
    danglingConsumer: { type: Number, default: 0 },
    negConsumer: { type: Number, default: 0 },
    numberOfElements: { type: Number },
    memberCount: { type: Number },
    inactive: Boolean,
    private: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    betEnabled: { type: Boolean, default: true },
    defaultPost: { type: String, default: 'link' },

    customParams: {}
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

CommunitySchema.virtual('admins', {
  ref: 'CommunityMember',
  localField: 'slug',
  foreignField: 'community'
});

CommunitySchema.virtual('superAdmins', {
  ref: 'CommunityMember',
  localField: 'slug',
  foreignField: 'community'
});

CommunitySchema.virtual('members', {
  ref: 'CommunityMember',
  localField: 'slug',
  foreignField: 'community'
});

CommunitySchema.index({ slug: 1 });

// Validate _id
CommunitySchema.path('slug').validate(
  slug => NAME_PATTERN.test(slug),
  'Username can only contain letters, numbers, dashes and underscores'
);

CommunitySchema.pre('remove', async function remove(next) {
  const members = await this.model('CommunityMember').find({ community: this.slug });
  await this.model('CommunityMember')
    .deleteMany({ community: this.slug })
    .exec();
  // THIS IS TRICKY BECAUSE OF LEAVE RACE CONDITIONS
  const leave = members.map(async m => this.leave(m.user));
  if (leave) await Promise.all(leave);
  next();
});

CommunitySchema.methods.updateMemeberCount = async function updateMemeberCount() {
  this.memberCount = await this.model('CommunityMember').countDocuments({
    communityId: this._id
  });
  return this.save();
};

CommunitySchema.methods.leave = async function leave(userId) {
  await this.model('CommunityMember').deleteOne({ user: userId, communityId: this._id });
  await this.updateMemeberCount();
};

CommunitySchema.methods.join = async function join(userId, role, dontUpdateCount) {
  const superAdmin = role === 'superAdmin';

  const { _id: communityId, slug: community } = this;
  const user = await this.model('User').findOne({ _id: userId }, 'name image handle');
  if (!user) throw new Error('missing user');

  let member = await this.model('CommunityMember').findOne({
    user: user._id,
    communityId
  });

  if (member && role === 'admin') {
    member.role = 'admin';
    return member.save();
  }

  if (member && superAdmin) {
    member.superAdmin = true;
    return member.save();
  }

  if (member) return member;

  member = {
    user: userId,
    embeddedUser: user,
    communityId,
    community,
    reputation: 0,
    superAdmin,
    role: superAdmin ? 'admin' : role || 'user'
  };

  member = new (this.model('CommunityMember'))(member);
  await member.save();

  if (!dontUpdateCount) {
    await this.updateMemeberCount();
  }

  const memberEvent = {
    _id: user._id,
    type: 'ADD_USER_MEMBERSHIP',
    payload: member
  };
  socketEvent.emit('socketEvent', memberEvent);

  return member;
};

CommunitySchema.methods.setCustomParams = async function setCustomParams(params) {
  this.customParams = params;
  return this.save();
};

export default mongoose.model('Community', CommunitySchema);
