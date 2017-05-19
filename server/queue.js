import request from 'request-promise-any';
import queue from 'queue';
import User from './api/user/user.model';
import Stats from './api/statistics/statistics.model';
import Earnings from './api/earnings/earnings.model';
import apnData from './pushNotifications';
import Notification from './api/notification/notification.model';
import Meta from './api/metaPost/metaPost.model';
import Relevance from './api/relevance/relevance.model';
import * as proxyHelpers from './api/post/html';

const extractor = require('unfluff');
// import Treasury from './api/treasury/treasury.model';

// const MINUMUM_BALANCE = 5;
// const DAILY_INCOME = 5;

// let COIN = true;

function extractDomain(url) {
  let domain;
  if (url.indexOf('://') > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }
  domain = domain.split(':')[0];

  let noPrefix = domain;

  if (domain.indexOf('www.') > -1) {
    noPrefix = domain.replace('www.', '');
  }
  return noPrefix;
}

let q = queue({
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

function updateUserStats() {
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
        let day = date.setHours(0, 0, 0, 0);
        let endTime = day + (24 * 60 * 60 * 1000);
        let query = {
          user: user._id,
          startTime: day,
          endTime
        };
        let set = {};
        set['hours.' + hour] = user.relevance || 0;
        let update = {
          $set: set
        };
        Stats.update(query, update, { upsert: true })
        .exec((statsError) => {
          if (!statsError) cb();
          else throw statsError;
        });
      });
    });
    q.start((queErr, results) => {
      if (queErr) return console.log(queErr);
      return console.log('all done: ', results);
    });
  });
}

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

          if (!user.onboarding) {
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

  function updateUsers(teir) {
    return (user) => {
      q.push(async cb => {
        try {
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
        }
        // call queue callback
        cb();
      });
    };
  }

  tier1.forEach(updateUsers(1));
  tier2.forEach(updateUsers(2));
  tier3.forEach(updateUsers(3));

  q.start((queErr, results) => {
    if (queErr) return console.log(queErr);
    if (done) done()
    return console.log('all finished basic income: ');
  });
}


async function populateMeta() {
  // let fbHeader = {
  //   'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  // };
  try {
    let all = await Meta.find({ url: { $ne: null } });
    all.forEach(meta => {
      q.push(async cb => {
        try {
          // let resonse = await request({
          //   url: meta.url,
          //   maxRedirects: 20,
          //   jar: true,
          //   // headers: meta.url.match('apple.news') ? {} : fbHeader
          // });
          // if (!resonse) throw new Error('problem getting url');
          // if (!url.match('http://') && !url.match('https://')) {
          //   url = 'http://';
          // }

          let url = meta.url;

          // console.log('url: ', url);
          let article = await proxyHelpers.getReadable(url);
          let short = proxyHelpers.trimToLength(article.article, 140);
          meta.shortText = short.innerHTML;
          meta.articleAuthor = article.byline;
          console.log('author ', meta.shortText.length);
          // meta.url = url;

          // meta.domain = extractDomain(meta.url);
          // let unfluff = extractor(resonse);

          // meta.shortText = unfluff.text.split(/\s+/, 300).join(' ');
          // meta.articleAuthor = unfluff.author;
          // if (unfluff.date) {
          //   let date = Date.parse(unfluff.date);
          //   if (!date) date = Date.parse(unfluff.date.replace(/-500$/, ''));
          //   if (date) meta.articleDate = date;
          //   if (!date) console.log('couldn\'t convert date ', unfluff.date)
          // }
          // meta.publisher = unfluff.publisher;
          // meta.links = unfluff.links;
          // console.log(short);
          meta = await meta.save();

        } catch (err) {
          console.log(err.message);
        }
        cb();
      });
    });
  } catch (err) {
    console.log('populate error ', err);
  }

  q.start((queErr, results) => {
    if (queErr) return console.log(queErr);
    return console.log('all finished populating meta: ');
  });
}

async function populatePosts() {
  try {
    let all = await Meta.find({ url: { $ne: null } }).populate('commentary');
    all.forEach(meta => {
      // console.log(meta.url);
      let posts = meta.commentary;
      posts.forEach(post => {
        q.push(async cb => {
          try {
            post.shortText = meta.shortText;
            post.articleAuthor = meta.articleAuthor;
            // post.articleDate = meta.articleDate;
            // post.publisher = meta.publisher;
            // post.links = meta.links;
            post = await post.save();
            // console.log(post.shortText);
          } catch (err) {
            console.log(err.message);
          }
          cb();
        });
      });
    });
  } catch (err) {
    console.log('populate error ', err);
  }

  q.start((queErr, results) => {
    if (queErr) return console.log(queErr);
    return console.log('all finished populating posts: ');
  });
}

// basicIncome();
// populateMeta();
// populatePosts();

function startBasicIncomeUpdate() {
  setInterval(basicIncome, 24 * 60 * 60 * 1000);
  basicIncome();
}

function startStatsUpdate() {
  // taking too long - should move to diff thread?
  setInterval(updateUserStats, 60 * 60 * 1000);
  updateUserStats();
}

if (process.env.NODE_ENV === 'production') {
  updateUserStats();

  // start interval on the hour
  let minutesTillHour = 60 - (new Date()).getMinutes();
  setTimeout(() => startStatsUpdate(), minutesTillHour * 60 * 1000);

  let hoursTillNoon = 14 - (new Date()).getHours();
  if (hoursTillNoon < 0) hoursTillNoon += 24;
  setTimeout(() => {
    startBasicIncomeUpdate(() => getUserRank());
  }, hoursTillNoon * 60 * 60 * 1000);
}

