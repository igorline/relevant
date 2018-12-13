import { NAME_PATTERN } from '../../../app/utils/text';
import * as ethUtils from '../../utils/ethereum';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommunitySchema = new Schema({
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
    console.log('PRE REMOVE! ', this.slug);
    const members = await this.model('CommunityMember').find({ community: this.slug });
    console.log('found members ', members.length);
    await this.model('CommunityMember').remove({ community: this.slug }).exec();

    console.log('removed members', this.slug);
    // THIS IS TRICKY BECAUSE OF LEAVE RACE CONDITIONS
    const leave = members.map(async m => this.leave(m.user));
    console.log('awaiting promises ', this.slug);
    if (leave) await Promise.all(leave);
    // await this.model('CommunityMember').find({ community: this.slug }).remove().exec();
    console.log('finished removing members for ', this.slug);
    next();
  } catch (err) { console.log(err); throw err; }
});

// CommunitySchema.methods.updateMemberWeights = async function updateMemberWeights(members) {

// }


CommunitySchema.methods.leave = async function leave(userId) {
  try {
    const user = await this.model('User').findOne({ _id: userId }, 'name balance ethAddress image');

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
    const member = memberships.filter(m => m.communityId.toString() === this._id.toString())[0];

    memberships = memberships.filter(m => m.communityId.toString() !== this._id.toString());
    if (member) {
      await member.remove();
      console.log('membership being removed', member.user, ' ', member.weight, ' ', member.community);
    }

    const weight = 1 - memberships.reduce((a, m) => m.weight + a, 0);

    // let availableTokens = member.weight * userBalance;
    const updatedMemberships = memberships.map(async m => {
      try {
        m.weight /= (1 - weight);
        m.balance = m.weight * userBalance;

        console.log('member updated ', m.user, ' ', m.community);
        console.log('memberships ', memberships.length);
        console.log('member weight ', m.weight);

        return await m.save();
      } catch (err) {
        console.log(err);
        return null;
      }
    });

    memberships = await Promise.all(updatedMemberships);
  } catch (err) {
    console.log('error leaving community ', err);
  }
};


CommunitySchema.methods.join = async function join(userId, role) {
  try {
    const user = await this.model('User').findOne({ _id: userId }, 'name balance ethAddress image');
    let member = await this.model('CommunityMember').findOne({ user: userId, communityId: this._id });
    if (member) throw new Error('member already exists ', userId);
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
        m.weight *= (1 - weight);
        m.balance = m.weight * userBalance;

        console.log('member added ', m.user, ' ', m.community);
        console.log('memberships ', count);
        console.log('member weight ', m.weight);
        return await m.save();
      } catch (err) {
        console.log(err);
        return null;
      }
    });
    memberships = await Promise.all(updatedMemberships);

    member = {
      user: userId,
      embededUser: user,
      weight,
      balance: tokensToAdd,
      communityId: this._id,
      community: this.slug,
      reputation: 0,
      role: role || 'user'
    };

    member = new (this.model('CommunityMember'))(member);
    await member.save();

    // sanity checks
    let totalWeight = weight;
    let totalBalance = tokensToAdd;
    memberships.forEach(m => {
      totalWeight += m.weight;
      totalBalance += m.balance;
    });
    console.log('for user ', userId);
    console.log('totalWeights should be 1 ', totalWeight);
    console.log('totalBalance should be ', userBalance, ' ', totalBalance);

    return member;
  } catch (err) {
    console.log('error adding member ', err);
  }
};

CommunitySchema.methods.getCurrentStake = async function getCurrentStake() {
  try {

  } catch (err) {
    console.log(err);
  }
};

CommunitySchema.statics.getBalances = async function getBalances() {
  try {
    // this.model('CommunityMember').find({}).then(console.log);
    return await this.model('CommunityMember').aggregate([{
      $group:
        {
          _id: '$community',
          balance: { $sum: '$balance' },
        }
    }]);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export default mongoose.model('Community', CommunitySchema);
