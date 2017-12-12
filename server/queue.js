const queue = require('queue');
const User = require('./api/user/user.model');
const Stats = require('./api/statistics/statistics.model');
const Earnings = require('./api/earnings/earnings.model');
const apnData = require('./pushNotifications');
const Notification = require('./api/notification/notification.model');
// const Meta = require('./api/metaPost/metaPost.model');
const Relevance = require('./api/relevance/relevance.model');
// const proxyHelpers = require('./api/post/html');
const RelevanceStats = require('./api/relevanceStats/relevanceStats.model');
const pagerank = require('./utils/pagerank');
const Invest = require('./api/invest/invest.model');
// const Treasury = require('./api/treasury/treasury.model');
const economy = require('./utils/economy.js');
const { PAYOUT_FREQUENCY } = require('./config/globalConstants');

const TwitterWorker = require('./utils/twitterWorker');


const extractor = require('unfluff');
// daily relevance decay
const DECAY = 0.99621947473649;

let q = queue({
  concurrency: 5,
  concurrency: 1,
});

q.on('timeout', (next, job) => {
  console.log('job timed out:', job.toString().replace(/\n/g, ''));
  next();
});

// q.on('success', function(result, job) {
//   console.log('job finished processing: ', job.id);
// });
// TODO make a que that updates users stats once in a while
// Stats.find({}).remove(() => {});

async function updateUserStats() {

  User.find({}, { _id: 1, relevance: 1 })
  .exec((err, res) => {
    if (err || !res) {
      console.log('db error', err);
      return;
    }
    res.forEach((user) => {
      q.push((cb) => {
        let date = new Date();
        let hour = date.getHours();
        let day = date.setUTCHours(0, 0, 0, 0);
        let endTime = day + (24 * 60 * 60 * 1000);
        let query = {
          user: user._id,
          date: day,
          endTime
        };
        let set = {};
        set['hours.' + hour] = user.relevance || 0;
        let update = {
          $set: set,
          $inc: { aggregateRelevance: user.relevance, totalSamples: 1 }
        };
        Stats.findOneAndUpdate(query, update, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        })
        .exec((statsError, stat) => {
          if (!statsError) cb();
          else throw statsError;
        });
      });
    });
    q.start((queErr, results) => {
      if (queErr) return console.log(queErr);
      return console.log('done updating stats');
    });
  });
}

// compute relevance using pagerank
async function userRank() {
  try {
    let users = await User.find({});
    let N = users.length;
    let rankedUsers = {};
    let originalRelevance = {};
    let originalUsers = {};
    let results = users.map(async user => {
      rankedUsers[user._id] = {};
      originalUsers[user._id] = user;
      originalRelevance[user._id] = user.relevance;
      let upvotes = await Invest.find({ investor: user._id });
      upvotes.forEach(upvote => {
        if (upvote.ownPost) return;
        let a = upvote.amount / Math.abs(upvote.amount);
        if (!a) a = 1;

        // time discount (6 month half-life)
        let now = new Date();
        let t = now.getTime() - upvote.createdAt.getTime();
        a *= Math.pow(1 / 2, t / ( 1000 * 60 * 60 * 24 * 30 * 6 ));

        if (rankedUsers[user._id][upvote.author]) {
          rankedUsers[user._id][upvote.author].weight += a;
        } else {
          rankedUsers[user._id][upvote.author] = { weight: a };
        }
      });
      return upvotes;
    });

    await Promise.all(results);
    Object.keys(rankedUsers).forEach(u => {
      Object.keys(rankedUsers[u]).forEach(name => {
        if (rankedUsers[u][name].weight < 0) delete rankedUsers[u][name];
      });
    });
    // console.log(rankedUsers);

    let scores = pagerank(
      rankedUsers,
      { alpha: 0.85, users: originalUsers }
    );
    // console.log(scores);
    let max = 0;
    let min = 1;


    let array = [];
    Object.keys(scores).forEach(user => {
      let u = scores[user];
      if (u > max) max = u;
      if (u < min) min = u;
      array.push({
        name: user,
        rank: u,
        relevance: originalRelevance[user]
      });
    });

    array = array.sort((a, b) => a.rank - b.rank);
    array.forEach(u => {
      let rank = Math.log10(N * u.rank + 1 - N * min) * (437 / Math.log10(N * max + 1 - N * min));
      let ratio = Math.round(rank / u.relevance);
      // if (ratio > 2) {
        console.log('name: ', u.name);
        console.log('pageRank: ', Math.round(rank), ' rel: ', Math.round(u.relevance));
        console.log('RATIO ', Math.round(rank * 100 / u.relevance) / 100 || 0);
        console.log('-----')
      // }
    });


  } catch (err) {
    console.log(err);
  }
}
// userRank();

// setTimeout(basicIncome, 10000);
async function getUserRank() {
  try {
    let totalUsers = await User.count({ relevance: { $gt: 0 } });
    let grandTotal = await User.count({});
    let topUser = await User.findOne({}).sort('-relevance').limit(1);
    let topR = topUser.relevance;
    let users = await User.find({});
    users.forEach(user => {
      q.push(async cb => {
        try {
          let rank = await User.find({ relevance: { $lt: user.relevance, $gt: 0 } }).count();
          // let tied = await User.find({ relevance: user.relevance }).count();

          let percentRank = Math.round(((rank) * 100) / (totalUsers));
          let level = Math.round(1000 * user.relevance / topR) / 10;

          user.percentRank = percentRank;
          user.rank = totalUsers - rank;
          user.level = level;
          user.totalUsers = totalUsers;

          let topicRelevance = await Relevance.find({ user: user._id, tag: { $ne: null } })
          .sort('-relevance')
          .limit(5);

          user.topTopics = topicRelevance.map(tR => tR.tag);

          let topicPromises = topicRelevance.map(async tR => {
            let topTopicUser = await Relevance.findOne({ tag: tR.tag })
            .sort('-relevance')
            .limit(1);
            let topTopicR = topTopicUser.relevance;

            let totalTopicUsers = await Relevance.find({ tag: tR.tag }).count();
            let topicRank = await Relevance.find({ tag: tR.tag, relevance: { $lt: tR.relevance } }).count();
            let topicPercentRank = Math.round((topicRank * 100) / (totalTopicUsers));
            let level = Math.round(1000 * (tR.relevance / topTopicR)) / 10;
            // console.log(level)
            // console.log(user._id, ' ', tR.tag);
            // console.log('percent ', topicPercentRank);
            // console.log('rank ', (totalTopicUsers - topicRank));
            // console.log('level ', level);
            tR.percentRank = topicPercentRank;
            tR.level = level;
            tR.rank = (totalTopicUsers - topicRank);
            tR.totalUsers = totalTopicUsers;
            await tR.save();
          });

          if (!user.onboarding || typeof user.onboarding !== 'number') {
            user.onboarding = 0;
          }

          await Promise.all(topicPromises);

          await user.save();
          // console.log(user._id, ' ', percentRank);
          // console.log(user._id, ' ', user.rank);
          // console.log(user._id, ' ', level);
        } catch (err) {
          console.log(err);
        }
        cb();
      });
    });
  } catch (err) {
    console.log(err);
  }

  q.start((queErr, results) => {
    if (queErr) return console.log(queErr);
    return console.log('finished computing rank');
  });
}

// getUserRank();

async function basicIncome(done) {
  let all = await User.find({});

  let tier1 = await User.find({
    balance: { $lt: 6 },
    relevance: { $lt: 10 }
  }, 'balance name deviceTokens relevance relevanceRecord');

  let tier2 = await User.find({
    balance: { $lt: 10 },
    relevance: { $gte: 10, $lt: 50 }
  }, 'balance name deviceTokens relevance relevanceRecord');

  let tier3 = await User.find({
    balance: { $lt: 20 },
    relevance: { $gte: 50 }
  }, 'balance name deviceTokens relevance relevanceRecord');

  let topicRelevance = await Relevance.find({});

  function updateUsers(teir) {
    return (user) => {
      q.push(async cb => {
        try {
          console.log('updating users ', teir)
          let balanceIncrease;
          if (teir === 1) balanceIncrease = 5;
          if (teir === 2) balanceIncrease = 10;
          if (teir === 3) balanceIncrease = 20;

          // let balance = Math.min(user.balance + balanceIncrease, balanceIncrease);
          // balanceIncrease = balance - user.balance;
          user.balance += balanceIncrease;

          let earning = {
            user: user._id,
            amount: balanceIncrease,
            source: 'treasury'
          };
          await Earnings.updateUserBalance(earning);

          user = await user.save();
          user.updateClient();

          let notification = {
            source: 'treasury',
            forUser: user._id,
            coin: balanceIncrease,
            type: 'basicIncome',
          };

          await Notification.createNotification(notification);

          let alert = 'We noticed you were running low on coins so we gave you some more.';
          let payload = {};
          try {
            apnData.sendNotification(user, alert, payload);
          } catch (err) { console.log('Push notification error'); }
        } catch (err) {
          console.log('error updating basic income ', err);
          console.log(user);
          cb();
        }
        // call queue callback
        cb();
      });
    };
  }

  function updateUserRelevance() {
    console.log('updating user relevance');
    // let treasury = Treasury.findOne();
    return user => {
      q.push(async cb => {
        try {
          let r = user.relevance * DECAY;
          let diff = r - user.relevance;
          user.relevance += diff;

          user.updateRelevanceRecord();
          RelevanceStats.updateUserStats(user, diff);

          await user.save();
        } catch (err) {
          console.log('error updating user relevance income ', err);
          console.log(user);
          cb();
        }
        cb();
      });
    };
  }

  function updateTopicRelevance() {
    console.log('updating topic relevance');
    return (topic) => {
      q.push(async cb => {
        try {
          let r = topic.relevance * DECAY;
          let diff = r - topic.relevance;
          topic.relevance += diff;
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

  tier1.forEach(updateUsers(1));
  tier2.forEach(updateUsers(2));
  tier3.forEach(updateUsers(3));
  all.forEach(updateUserRelevance());
  topicRelevance.forEach(updateTopicRelevance());

  q.start((queErr, results) => {
    if (queErr) return console.log(queErr);
    if (done) done();
    return console.log('all finished basic income: ');
  });

  q.on('timeout', function(next, job) {
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
  // setInterval(basicIncome, 24 * 60 * 60 * 1000);

  basicIncome(() => getUserRank());
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
  await economy.rewards();
}

function startRewards() {
  // taking too long - should move to diff thread?
  setInterval(updateRewards, PAYOUT_FREQUENCY);
  updateRewards();
}

function startTwitterUpdate() {
  setInterval( TwitterWorker.updateTwitterPosts, 60 * 60 * 1000);
  TwitterWorker.updateTwitterPosts();
}


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


  setTimeout(() => {
    startBasicIncomeUpdate();
  }, getNextUpdateTime());
}

