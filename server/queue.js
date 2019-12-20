const queue = require('queue');
const computePageRank = require('server/pagerank/pagerankCompute').default;
const Stats = require('./api/statistics/statistics.model');
const Relevance = require('./api/relevance/relevance.model');
const Community = require('./api/community/community.model').default;
const ethRewards = require('./utils/ethRewards.js');

/* eslint no-console: 0 */
const relevantEnv = process.env.RELEVANT_ENV;

const q = queue({ concurrency: 5 });

q.on('timeout', (next, job) => {
  console.log('job timed out:', job.toString().replace(/\n/g, ''));
  next();
});

async function updateUserStats() {
  const repuatations = await Relevance.find({ global: true });
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

// setTimeout(updateRepChange, 10000);

async function getCommunityUserRank(community) {
  try {
    const communityId = community._id;
    const totalUsers = await Relevance.countDocuments({
      pagerank: { $gt: 0 },
      global: true,
      communityId
    });
    // let grandTotal = await Relevance.countDocuments({ global: true, communityId });
    const topUser = await Relevance.findOne({})
      .sort('-pagerank')
      .limit(1);
    const topR = topUser.pagerank;
    const users = await Relevance.find({
      global: true,
      communityId,
      user: { $exists: true }
    });

    return users.forEach(user => {
      q.push(async cb => {
        try {
          const rank = await Relevance.countDocuments({
            pagerank: { $lt: user.pagerank, $gt: 0 },
            communityId
          });
          const percentRank = Math.round((rank * 100) / totalUsers);
          const level = Math.round((1000 * user.pagerank) / topR) / 10;

          user.percentRank = percentRank;
          user.rank = totalUsers - rank;
          user.level = level;
          user.totalUsers = totalUsers;

          // this will update both global and local reps
          const topicRelevance = await Relevance.find({
            user: user._id,
            tag: { $ne: null },
            communityId
          })
            .sort('-relevance')
            .limit(5);

          user.topTopics = topicRelevance.map(tR => tR.tag);

          // TODO this may not work!
          const topicPromises = topicRelevance.map(async tR => {
            const topTopicUser = await Relevance.findOne({ tag: tR.tag, communityId })
              .sort('-relevance')
              .limit(1);
            const topTopicR = topTopicUser.relevance;

            const totalTopicUsers = await Relevance.find({
              tag: tR.tag
            }).countDocuments();
            const topicRank = await Relevance.countDocuments({
              tag: tR.tag,
              relevance: { $lt: tR.relevance }
            });

            const topicPercentRank = Math.round((topicRank * 100) / totalTopicUsers);

            tR.percentRank = topicPercentRank;
            tR.level = Math.round(1000 * (tR.relevance / topTopicR)) / 10;
            tR.rank = totalTopicUsers - topicRank;
            tR.totalUsers = totalTopicUsers;

            // console.log('_TAGS_', user.user, ' ', tR.tag);
            // console.log('percent ', topicPercentRank);
            // console.log('rank ', (totalTopicUsers - topicRank));
            // console.log('level ', tR.level);

            return tR.save();
          });

          if (!user.onboarding || typeof user.onboarding !== 'number') {
            user.onboarding = 0;
          }

          await Promise.all([...topicPromises]);

          await user.save();
          // console.log('percentRank', user.user, ' ', percentRank);
          // console.log('rank', user.user, ' ', user.rank);
          // console.log('level', user.user, ' ', level);
        } catch (err) {
          return console.log(err);
        }
        return cb();
      });
    });
  } catch (err) {
    return console.log('error computing rank for ', community.slug, err);
  }
}

// update reputation using pagerank
async function updateReputation() {
  try {
    const communities = await Community.find({});
    const communityRank = communities.map(getCommunityUserRank);
    await Promise.all(communityRank);
    console.log('finished computing reputation');
  } catch (err) {
    console.log(err);
  }
}

async function updateRepChange() {
  const rep = await Relevance.find({ global: true });

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
  updateRepChange,
  updateReputation
};
