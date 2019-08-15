import mongoose from 'mongoose';
import { NAME_PATTERN } from 'app/utils/text';
import * as ethUtils from 'server/utils/ethereum';
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
    numberOfElements: { type: Number },
    memberCount: { type: Number },
    inactive: Boolean,
    private: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false }
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
  try {
    const members = await this.model('CommunityMember').find({ community: this.slug });
    await this.model('CommunityMember')
    .deleteMany({ community: this.slug })
    .exec();
    // THIS IS TRICKY BECAUSE OF LEAVE RACE CONDITIONS
    const leave = members.map(async m => this.leave(m.user));
    if (leave) await Promise.all(leave);
    next();
  } catch (err) {
    throw err;
  }
});

CommunitySchema.methods.updateMemeberCount = async function updateMemeberCount() {
  try {
    this.memberCount = await this.model('CommunityMember').countDocuments({
      communityId: this._id
    });
    return this.save();
  } catch (err) {
    throw err;
  }
};

CommunitySchema.methods.leave = async function leave(userId) {
  try {
    const user = await this.model('User').findOne(
      { _id: userId },
      'name balance ethAddress image'
    );

    let userBalance = user.balance || 0;
    let tokenBalance = 0;
    const ethAddress = user.ethAddress[0];
    if (ethAddress) {
      // TODO - balance should be locked for 3 days
      // TODO - shouldn't need to do this - subscribe to contract events
      tokenBalance = await ethUtils.getBalance(ethAddress);
      userBalance += tokenBalance;
    }

    let memberships = await this.model('CommunityMember').find({ user: userId });
    const member = memberships.filter(
      m => m.communityId.toString() === this._id.toString()
    )[0];

    memberships = memberships.filter(
      m => m.communityId.toString() !== this._id.toString()
    );
    if (member) {
      await member.remove();
      // console.log(
      //   'membership being removed',
      //   member.user,
      //   ' ',
      //   member.weight,
      //   ' ',
      //   member.community
      // );
    }

    const weight = 1 - memberships.reduce((a, m) => m.weight + a, 0);

    // let availableTokens = member.weight * userBalance;
    const updatedMemberships = memberships.map(async m => {
      try {
        m.weight /= 1 - weight;
        m.balance = m.weight * userBalance;
        // console.log('member updated ', m.user, ' ', m.community);
        // console.log('memberships ', memberships.length);
        // console.log('member weight ', m.weight);
        return await m.save();
      } catch (err) {
        throw err;
      }
    });

    memberships = await Promise.all(updatedMemberships);
    await this.updateMemeberCount();
  } catch (err) {
    throw err;
  }
};

CommunitySchema.methods.join = async function join(userId, role) {
  try {
    const { _id: communityId, slug: community } = this;
    const user = await this.model('User').findOne(
      { _id: userId },
      'name balance ethAddress image handle'
    );
    if (!user) throw new Error('missing user');
    let member = await this.model('CommunityMember').findOne({
      user: userId,
      communityId: this._id
    });

    if ((member && role === 'admin') || role === 'superAdmin') {
      member.role = 'admin';
      member.superAdmin = role === 'superAdmin';
      return member.save();
    }

    if (member) return member;

    await this.model('Relevance').create({ userId, communityId, community });

    let userBalance = user.balance || 0;
    let tokenBalance = 0;
    const ethAddress = user.ethAddress[0];
    if (ethAddress) {
      // TODO - shouldn't need to do this - subscribe to contract events
      tokenBalance = await ethUtils.getBalance(ethAddress);
      userBalance += tokenBalance;
    }

    let memberships = await this.model('CommunityMember').find({ user: userId });
    const count = 1 + memberships.length;

    const tokensToAdd = userBalance / count;
    const weight = 1 / count;

    const updatedMemberships = memberships.map(async m => {
      try {
        m.weight *= 1 - weight;
        m.balance = m.weight * userBalance;
        return await m.save();
      } catch (err) {
        throw err;
      }
    });
    memberships = await Promise.all(updatedMemberships);

    member = {
      user: userId,
      embeddedUser: user,
      weight,
      balance: tokensToAdd,
      communityId,
      community,
      reputation: 0,
      role: role || 'user'
    };

    member = new (this.model('CommunityMember'))(member);
    await member.save();

    // TODO sanity checks - move this to test
    // let totalWeight = weight;
    // let totalBalance = tokensToAdd;
    // memberships.forEach(m => {
    //   totalWeight += m.weight;
    //   totalBalance += m.balance;
    // });
    // console.log('for user ', userId);
    // console.log('totalWeights should be 1 ', totalWeight);
    // console.log('totalBalance should be ', userBalance, ' ', totalBalance);

    await this.updateMemeberCount();

    const memberEvent = {
      _id: user._id,
      type: 'ADD_USER_MEMBERSHIP',
      payload: member
    };
    socketEvent.emit('socketEvent', memberEvent);

    return member;
  } catch (err) {
    throw err;
  }
};

CommunitySchema.statics.getBalances = async function getBalances() {
  try {
    // this.model('CommunityMember').find({}).then(console.log);
    return await this.model('CommunityMember').aggregate([
      {
        $group: {
          _id: '$community',
          stakedTokens: { $sum: '$balance' }
        }
      }
    ]);
  } catch (err) {
    throw err;
  }
};

export default mongoose.model('Community', CommunitySchema);
