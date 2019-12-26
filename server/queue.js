import CommunityMember from 'server/api/community/community.member.model';
import queue from 'queue';
import computePageRank from 'server/pagerank/pagerankCompute';
import Stats from './api/statistics/statistics.model';
import Community from './api/community/community.model';
import ethRewards from './utils/ethRewards';

/* eslint no-console: 0 */
const relevantEnv = process.env.RELEVANT_ENV;

const q = queue({ concurrency: 5 });

q.on('timeout', (next, job) => {
  console.log('job timed out:', job.toString().replace(/\n/g, ''));
  next();
});

async function updateUserStats() {
  const repuatations = await CommunityMember.find({});
  repuatations.forEach(rel => {
    q.push(async cb => {
      const date = new Date();
      const hour = date.getHours();
      const day = date.setUTCHours(0, 0, 0, 0);
      const endTime = day + 24 * 60 * 60 * 1000;
      const query = {
        user: rel.user,
        date: day,
        endTime,
        communityId: rel.communityId
      };
      const set = {};
      set['hours.' + hour] = rel.pagerank || 0;
      const update = {
        $set: set,
        $inc: { aggregateRelevance: rel.pagerank, totalSamples: 1 }
      };
      await Stats.findOneAndUpdate(query, update, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      });
      cb();
    });
  });

  return new Promise((resolve, reject) => {
    q.start(err => (err ? reject(err) : resolve()));
  });
}

async function updateRepChange() {
  const rep = await CommunityMember.find();

  rep.forEach(userRep =>
    q.push(async cb => {
      try {
        if (userRep.user) {
          // updates % stats
          await userRep.updateRelevanceRecord();
          await userRep.save();
        }
      } catch (err) {
        console.log('error updating topic relevance income ', err);
      }
      cb();
    })
  );

  return new Promise((resolve, reject) => {
    q.start(err => (err ? reject(err) : resolve()));
  });
}

// eslint-disable-next-line
async function pagerank(community) {
  const communityId = (await Community.findOne({ slug: community }))._id;
  await computePageRank({ communityId, community, debug: true });
}

async function updateRewards() {
  try {
    await ethRewards.rewards();
    console.log('done updating rewards');
  } catch (err) {
    console.log(err);
  }

  try {
    await updateUserStats();
    console.log('done updating stats');

    const now = new Date();
    if (now.getUTCHours() === 14) {
      await updateRepChange();
      console.log('done updating rep stats: ');
    }
  } catch (err) {
    console.log(err);
  }

  if (relevantEnv === 'staging' || process.env.NODE_ENV === 'native') {
    return;
  }
  process.exit();
}

if (process.env.NODE_ENV === 'production') {
  updateRewards();
}

module.exports = {
  updateUserStats,
  updateRepChange
};
