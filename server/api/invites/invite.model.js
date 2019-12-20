import mongoose from 'mongoose';
import computeApproxPageRank from 'server/pagerank/computeApproxPageRank';

const { Schema } = mongoose;

const InviteSchema = new Schema(
  {
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    invitee: { type: Schema.Types.ObjectId, ref: 'User' },
    registeredAs: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String },
    name: { type: String },
    redeemed: { type: Boolean, default: false },
    number: { type: Number, default: 1 },
    status: { type: String },
    invitedByString: { type: String },
    code: { type: String, index: true },
    url: String,
    type: String, // referral / admin
    community: String,
    communityId: { type: Schema.Types.ObjectId, ref: 'Community' }
  },
  {
    timestamps: true
  }
);

InviteSchema.statics.checkInvite = async function checkInvite(invite) {
  if (!invite) throw new Error('No invitation code found');
  invite = await this.findOne({ _id: invite._id, redeemed: false });
  if (!invite) throw new Error('No invitation code found');
  return invite;
};

InviteSchema.statics.processInvite = async function processInvite({
  invitecode,
  user,
  isNotNew
}) {
  const invite = await this.model('Invite').findOne({
    code: invitecode,
    redeemed: { $ne: true }
  });
  if (isNotNew && (user.balance > 0 && invite !== 'admin')) return user;
  if (invite) return referralRewards({ invite, user, Invite: this });

  const publicInvite = await this.model('User').findOne({ handle: invitecode });
  if (publicInvite) return publicReward({ inviter: publicInvite, user, Invite: this });
  return user;
};

async function publicReward({ user, inviter }) {
  await inviter.addReward({ type: 'publicLink', user });
  return user.addReward({ type: 'publicInvite', user: inviter });
}

async function referralRewards({ invite, user, Invite }) {
  // InviteSchema.methods.referral = async function referral(user) {
  const { communityId, community } = invite;
  invite.status = 'registered';
  invite.number -= 1;
  if (invite.number === 0) invite.redeemed = true;
  invite.registeredAs = user._id;
  await invite.save();

  let inviter = await Invite.model('User')
    .findOne({ _id: invite.invitedBy })
    .populate({
      path: 'relevance',
      match: { communityId, global: true }
    });

  const communityInstance = await Invite.model('Community').findOne({
    _id: communityId
  });
  const role = invite.type === 'admin' ? 'admin' : null;
  await communityInstance.join(user._id, role);

  if (role === 'admin') {
    const relevance = await Invite.model('Relevance').findOne({
      user: user._id,
      communityId,
      global: true
    });
    relevance.pagerank = 70;
    await relevance.save();
    user.relevance = relevance;
    return user;
  }

  user = await user.addReward({ type: 'referredBy', user: inviter });
  inviter = await inviter.addReward({ type: 'referral', user });

  // console.log('updated relevance', updatedUser);
  if (user.email === invite.email) user.confirmed = true;

  const vote = new (Invite.model('Invest'))({
    investor: inviter._id,
    author: user._id,
    amount: Math.min(1, (100 - inviter.relevance.pagerank + 50) / 100),
    ownPost: false,
    communityId,
    community
  });
  await vote.save();

  const { author: updatedUser } = await computeApproxPageRank({
    communityId,
    author: user,
    vote,
    user: inviter
  });

  return updatedUser;
}

module.exports = mongoose.model('Invite', InviteSchema);
