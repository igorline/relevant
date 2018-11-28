const queue = require('queue');
const Stats = require('./api/statistics/statistics.model');
const Relevance = require('./api/relevance/relevance.model');
// const computePageRank = require('./utils/pagerankCompute').default;
const Community = require('./api/community/community.model').default;
const ethRewards = require('./utils/ethRewards.js');

const { PAYOUT_FREQUENCY } = require('./config/globalConstants');

const TwitterWorker = require('./utils/twitterWorker');

const DECAY = 0.99621947473649;

let q = queue({
  // concurrency: 5,
  concurrency: 1,
});

q.on('timeout', (next, job) => {
  console.log('job timed out:', job.toString().replace(/\n/g, ''));
  next();
});

async function updateUserStats() {
  Relevance.find({ global: true })
  .exec((err, res) => {
    if (err || !res) {
      console.log('db error', err);
      return;
    }
    res.forEach((rel) => {
      q.push((cb) => {
        let date = new Date();
        let hour = date.getHours();
        let day = date.setUTCHours(0, 0, 0, 0);
        let endTime = day + (24 * 60 * 60 * 1000);
        let query = {
          user: rel.user,
          date: day,
          endTime,
          communityId: rel.communityId,
        };
        let set = {};
        set['hours.' + hour] = rel.pagerank || 0;
        let update = {
          $set: set,
          $inc: { aggregateRelevance: rel.pagerank, totalSamples: 1 }
        };
        Stats.findOneAndUpdate(query, update, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        })
        .exec((statsError) => {
          if (!statsError) cb();
          else throw statsError;
        });
      });
    });
    q.start((queErr) => {
      if (queErr) return console.log(queErr);
      return console.log('done updating stats');
    });
  });
}

// setTimeout(basicIncome, 10000);

async function getCommunityUserRank(community) {
  try {
    let communityId = community._id;
    let totalUsers = await Relevance.count({ pagerank: { $gt: 0 }, global: true, communityId });
    // let grandTotal = await Relevance.count({ global: true, communityId });
    let topUser = await Relevance.findOne({}).sort('-pagerank').limit(1);
    let topR = topUser.pagerank;
    let users = await Relevance.find({ global: true, communityId });

    return users.forEach(user => {
      q.push(async cb => {
        try {
          let rank = await Relevance.count({
            pagerank: { $lt: user.pagerank, $gt: 0 }, communityId
          });
          let percentRank = Math.round(((rank) * 100) / (totalUsers));
          let level = Math.round(1000 * user.pagerank / topR) / 10;

          user.percentRank = percentRank;
          user.rank = totalUsers - rank;
          user.level = level;
          user.totalUsers = totalUsers;

          // this will update both global and local reps
          let topicRelevance = await Relevance.find({
            user: user._id,
            tag: { $ne: null },
            communityId
          })
          .sort('-relevance')
          .limit(5);

          user.topTopics = topicRelevance.map(tR => tR.tag);

          // TODO this may not work!
          let topicPromises = topicRelevance.map(async tR => {
            let topTopicUser = await Relevance.findOne({ tag: tR.tag, communityId })
            .sort('-relevance')
            .limit(1);
            let topTopicR = topTopicUser.relevance;

            let totalTopicUsers = await Relevance.find({ tag: tR.tag }).count();
            let topicRank = await Relevance.count({
              tag: tR.tag, relevance: { $lt: tR.relevance }
            });

            let topicPercentRank = Math.round((topicRank * 100) / (totalTopicUsers));

            tR.percentRank = topicPercentRank;
            tR.level = Math.round(1000 * (tR.relevance / topTopicR)) / 10;
            tR.rank = (totalTopicUsers - topicRank);
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
    let communities = await Community.find({});

    // WE DO THIS IN REWARDS
    // let computed = communities.map(community => {
    //   console.log('community ', community.slug)
    //   return computePageRank({ communityId: community._id, community: community.slug });
    // });
    // await Promise.all(computed);

    let communityRank = communities.map(getCommunityUserRank);
    await Promise.all(communityRank);
    console.log('finished computing reputation');
  } catch (err) {
    console.log(err);
  }
}

async function basicIncome(done) {
  let topicRelevance = await Relevance.find({});

  function updateTopicRelevance() {
    console.log('updating topic relevance');
    return (topic) => {
      q.push(async cb => {
        try {
          let r = topic.relevance * DECAY;
          let diff = r - topic.relevance;
          topic.relevance += diff;
          if (topic.global === true) {
            // console.log(topic);
            await topic.updateRelevanceRecord();
            // TODO update community stats
            // RelevanceStats.updateUserStats(topic, diff);
          }
          await topic.save();
        } catch (err) {
          console.log('error updating topic relevance income ', err);
          console.log(topic);
          cb();
        }
        cb();
      });
    };
  }

  topicRelevance.forEach(updateTopicRelevance());

  q.start((queErr) => {
    if (queErr) return console.log(queErr);
    if (done) done();
    return console.log('all finished basic income: ');
  });

  q.on('timeout', (next, job) => {
    console.log('error: queue timeout', job);
    next();
  });
}


function getNextUpdateTime() {
  console.log('get next time');
  let now = new Date();
  let h = now.getUTCHours();
  console.log(h);
  let nextUpdate = new Date();
  const computeHour = 14;

  if (h < computeHour) {
    nextUpdate.setUTCHours(14, 0, 0, 0);
  } else {
    nextUpdate.setDate(now.getDate() + 1);
    nextUpdate.setUTCHours(14, 0, 0, 0);
  }

  let timeToUpdate = nextUpdate.getTime() - now.getTime();
  console.log('now ', now);
  console.log('next update ', nextUpdate);

  global.nextUpdate = nextUpdate;
  return timeToUpdate;
}


getNextUpdateTime();

function startBasicIncomeUpdate() {
  // basic income is DEPRECATED
  basicIncome(updateReputation);
  setTimeout(() => {
    startBasicIncomeUpdate();
  }, getNextUpdateTime());
}

function startStatsUpdate() {
  // taking too long - should move to diff thread?
  setInterval(updateUserStats, 60 * 60 * 1000);
  updateUserStats();
}

async function updateRewards() {
  await ethRewards.rewards();
}

function startRewards() {
  // taking too long - should move to diff thread?
  setInterval(updateRewards, PAYOUT_FREQUENCY);
  updateRewards();
}

function startTwitterUpdate() {
  setInterval(TwitterWorker.updateTwitterPosts, 60 * 60 * 1000);
  TwitterWorker.updateTwitterPosts();
}

// basicIncome(updateReputation);
// updateUserStats();
// startStatsUpdate();
// startTwitterUpdate();

if (process.env.NODE_ENV === 'production') {
  updateUserStats();

  // start interval on the hour
  let minutesTillHour = 60 - (new Date()).getMinutes();
  setTimeout(() => {
    startStatsUpdate();
    startRewards();
  }, minutesTillHour * 60 * 1000);

  setTimeout(() => {
    startTwitterUpdate();
  }, ((10 + minutesTillHour) % 60) * 60 * 1000);
  // TwitterWorker.updateTwitterPosts();

  // DEPRECATED
  setTimeout(() => {
    startBasicIncomeUpdate();
  }, getNextUpdateTime());
}

// setTimeout(TwitterWorker.updateTwitterPosts, 5000);

module.exports = {
  updateUserStats,
  basicIncome,
  updateReputation
};
