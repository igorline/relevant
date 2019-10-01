/* eslint no-console: 0 */
/* eslint no-unused-vars: 0 */

import User from 'server/api/user/user.model';
import Earnings from 'server/api/earnings/earnings.model';
import Invest from 'server/api/invest/invest.model';
import PostData from 'server/api/post/postData.model';

const queue = require('queue');

const q = queue({
  concurrency: 1
});

async function auditUserEarnings() {
  const users = await User.find({ balance: { $gt: 0 } });
  users.forEach(userEarnings);
}

async function userEarnings(user) {
  const earnings = await Earnings.find({
    user: user._id,
    $or: [{ status: 'paidout' }]
  });

  const totalRewards = earnings.reduce((a, e) => e.earned + a, 0);
  const diff = difference(user, totalRewards);

  if (Math.abs(diff) > 0.000001) {
    console.log('error! earnings mismatch for', user._id);
    console.log(user.handle, 'discreptacy', diff);
  }
}

function difference(user, totalRewards) {
  return (
    user.balance +
    user.tokenBalance -
    user.airdropTokens -
    totalRewards -
    user.legacyTokens -
    user.legacyAirdrop
  );
}

function logUser(user, totalRewards) {
  console.log(
    user.handle,
    'balance:',
    user.balance,
    'tokenBalance:',
    user.tokenBalance,
    'newRewards:',
    totalRewards,
    'airdrop / referral',
    user.airdropTokens,
    '/',
    user.referralTokens,
    'legacyRewards:',
    user.legacyTokens,
    'legacyAirdrop:',
    user.legacyAirdrop
  );
}

async function auditUser(handle) {
  const user = await User.findOne({ handle });
  // console.log(user);
  const earnings = await Earnings.find({
    user: user._id,
    $or: [{ status: 'paidout' }, { status: 'expired' }]
  }).populate('post');
  const totalEarnigns = earnings.reduce((a, e) => e.earned + a, 0);

  let diff = difference(user, totalEarnigns);

  let adjust = 0;

  const postData = await earnings.map(async e => {
    const investments = await Invest.find({ post: e.post._id, investor: user._id });
    if (investments.length > 1) {
      console.log('multiple inv', investments);
    }
    const investment = investments[0];
    const postdata = await PostData.findOne({
      post: e.post,
      communityId: investment.communityId
    });

    if (!postdata) {
      console.log('missing post data for', e);
      console.log(' ');
      return;
    }

    if (e.communityId && !investment.communityId.equals(e.communityId)) {
      console.log('invest/earning mismatch', e.community, investment.community);
      if (!e.communityId) {
        // e.communityId = investment.communityId;
        // e.community = investment.community;
      }
    }

    const postInv = await Invest.find({ post: e.post._id });
    const invShares = postInv.reduce((a, inv) => inv.shares + a, 0);

    const estimatedReward = !postdata.payout
      ? 0
      : (postdata.payout * e.shares * 1e-18) / invShares;
    if (Math.abs(estimatedReward - e.earned) > 0.001) {
      console.log(e.post._id, e.post.title);
      console.log('shares', e.totalPostShares, postdata.shares, invShares);
      console.log('est vs payout', e.estimatedPostPayout, postdata.payout * 1e-18);
      console.log(estimatedReward, 'vs', e.earned);
      console.log('invest', investment.community, investment.createdAt);
      console.log('post', postdata.community, investment.createdAt);
      console.log('earning', e.community, e.earned, e.status);

      adjust += estimatedReward - e.earned;
      user.balance -= e.earned;

      diff = difference(user, totalEarnigns);
      e.communityId = investment.communityId;
      e.community = investment.community;
      e.earned = estimatedReward;
      e.status = 'paidout';
      // await e.save();
      console.log(' ');
    }
  });
  await Promise.all(postData);
  // user.balance -= diff;
  // await user.save();
  console.log(adjust, 'vs', diff);
}

async function listAllBalances() {
  const users = await User.find({ balance: { $gt: 0 } }).sort('-balance');
  users.forEach(u => console.log(u.handle, ',', u.balance));
}

export async function runAudit() {
  try {
    await auditUserEarnings();
    // await auditUser('slava');
    // listAllBalances();
    console.log('finished audit');
  } catch (err) {
    console.log(err);
  }
}

// runAudit();
