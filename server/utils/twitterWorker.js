import { promisify } from 'util';
import request from 'request';
import Meta from '../api/metaPost/metaPost.model';
import Post from '../api/post/post.model';
import * as proxyHelpers from '../api/post/html';
import { text } from '../../app/utils';
import * as postController from '../api/post/post.controller';
import TwitterFeed from '../api/twitterFeed/twitterFeed.model';
import Treasury from '../api/treasury/treasury.model';
import { TWITTER_DECAY } from '../config/globalConstants';

let requestAsync = promisify(request);

const TENTH_LIFE = 1 * 6 * 60 * 60 * 1000;


const Twitter = require('twitter');
const User = require('../api/user/user.model');
const queue = require('queue');

let allUsers;

// User.find({ _id: '4REALGLOBAL' }).then(u => console.log(u));

// TwitterFeed.find({ user: 'balasan', inTimeline: true }).then(posts => {
//   console.log(posts);
// })

// Post.find({ twitter: true }).sort('title').then(posts => {
//   posts.forEach(p => {
//     console.log('title ', p.title);
//     console.log('meta ', p.metaPost);
//   });
// });

// Post.find().then(posts => {
//   posts.forEach(p => {
//     p.upsertMetaPost();
//   });
// });

// Post.find({ twitter: true }).remove().exec();
// TwitterFeed.find({}).remove().exec();
// Meta.find({ twitter: true }).remove().exec();
// Meta.find({ twitterCommentary: { $exists: true } })
// .remove().exec();


// User.find({ twitterId: { $exists: true } }).then(users => {
//   users.map(u => {
//     console.log(u.twitterId);
//     let feed = new TwitterFeed
//   });
// });


let q = queue({
  concurrency: 1,
});

q.on('timeout', (next, job) => {
  console.log('job timed out:', job.toString().replace(/\n/g, ''));
  next();
});

let avgTwitterScore = 0;
let twitterCount = 0;

// updateAvg() {
//   avgTwitterScore
// }

async function computeRank(metaPost, user) {
  // let rank = metaPost.twitterScore;
  let rank = metaPost.seenInFeedNumber * 4 + Math.log(metaPost.twitterScore + 1) * 5;
  // rank *= metaPost.feedRelevance ? Math.log(metaPost.feedRelevance + 1) : 1;

  avgTwitterScore = (rank + avgTwitterScore * twitterCount) / (twitterCount + 1);
  twitterCount++;
  let personalize = avgTwitterScore * 1;
  console.log('personalize ', personalize);

  let newRank = (metaPost.latestTweet.getTime() / TENTH_LIFE) + Math.log10(rank + 1);
  let inFeedRank = (metaPost.latestTweet.getTime() / TENTH_LIFE) + Math.log10(personalize * 3 + rank);
  newRank = Math.round(newRank * 1000) / 1000;
  inFeedRank = Math.round(inFeedRank * 1000) / 1000;

  // console.log(metaPost.latestTweet);
  // console.log('time ', metaPost.latestTweet);
  // console.log(metaPost.title);
  // console.log('rank ', rank);
  // console.log('own rank', rank + 50);
  console.log('avgTwitterScore ', avgTwitterScore);
  console.log('twitterCount ', twitterCount);


  return { newRank, inFeedRank };
}

async function updateRank() {
  try {
    let treasury = await Treasury.findOne();

    let now = new Date();
    let lastUpdate = treasury.lastTwitterUpdate ? treasury.lastTwitterUpdate.getTime() : 0;
    let decay = (now.getTime() - lastUpdate) / TWITTER_DECAY;

    avgTwitterScore = treasury.avgTwitterScore * (1 - Math.min(1, decay)) || 0;
    twitterCount = treasury.twitterCount * (1 - Math.min(1, decay)) || 0;

    let metaPosts = await Meta.find({ twitter: true });
    metaPosts.forEach(async metaPost => {
      let { newRank, inFeedRank } = await computeRank(metaPost);
      // console.log(metaPost.title);
      // console.log(newRank);
      // console.log(inFeedRank);
      await TwitterFeed.update(
        { metaPost: metaPost._id, inTimeline: { $ne: true }},
        { rank: newRank },
        { upsert: false, multi: true }
      );
      await TwitterFeed.update(
        { metaPost: metaPost._id, inTimeline: true },
        { rank: inFeedRank },
        { upsert: false, multi: true }
      );
    });
  } catch (err) {
    console.log('error updating twitter rank ', err);
  }
}

// updateRank();

async function processTweet(tweet, user) {
  let originalTweet = tweet;
  if (tweet.retweeted_status) {
    tweet = tweet.retweeted_status;
  }

  console.log('processing tweet');

  if (!tweet.entities.urls.length || !tweet.entities.urls[0].url) {
    return;
  }

  if (tweet.entities.urls[0].expanded_url.match('twitter.com')) return;

  // console.log('extended ', tweet.extended_entities);
  // console.log('regular ', tweet.entities);

  // check if tw post exists
  // if it does, update feed and increment 'seen in feed counter'
  let post = await Post.findOne({ twitter: true, twitterId: tweet.id });
  let metaPost;

  if (post) {
    metaPost = await Meta.findOne({ _id: post.metaPost });
    if (metaPost) metaPost.seenInFeedNumber += 1;
    // await metaPost.save();
  } else {
    let processed = await Meta.findOne({ twitterUrl: tweet.entities.urls[0].expanded_url });
    if (processed) console.log('found existing ');

    if (!processed) {
      console.log('new post!');
      processed = await postController.previewDataAsync(tweet.entities.urls[0].expanded_url);
    }

    let dupPost = await Post.findOne({ twitterUser: tweet.user.id, link: processed.url });
    if (dupPost) return;
    // console.log(tweet.full_text);
    // console.log(tweet.entities.urls);

    let body = tweet.full_text
    .replace(new RegExp(tweet.entities.urls[0].url, 'g'), '')
    .replace(/&amp;/, '&');

    let tags = tweet.entities.hashtags.map(t => t.text);
    post = new Post({
      title: processed.title,
      link: processed.url,
      description: processed.description,
      image: processed.image,
      articleAuthor: processed.articleAuthor,
      domain: processed.domain,
      // TODO we are not using this
      shortText: processed.shortText,
      body,
      keywords: processed.keywords,
      tags,
      postDate: originalTweet.created_at,

      embeddedUser: {
        name: tweet.user.name,
        id: tweet.user.screen_name,
        image: tweet.user.profile_image_url_https.replace('_normal', '')
      },
      twitterUser: tweet.user.id,
      twitterId: tweet.id,
      twitterRetweets: tweet.retweet_count,
      twitterFavs: tweet.favorite_count,
      // TODO do we know user? use relevance!
      twitterScore: tweet.retweet_count + tweet.favorite_count,
      twitter: true,
      category: [],
      feedRelevance: user.relevance,
      twitterUrl: tweet.entities.urls[0].expanded_url
    });
    // console.log(post);
    metaPost = await post.upsertMetaPost();
    post.metaPost = metaPost._id;

    let heapUsed = process.memoryUsage().heapUsed;
    let mb = Math.round(100 * heapUsed / 1048576) / 100;
    console.log('Program is using ' + mb + 'MB of Heap.');

    processed = null;
    await post.save();
  }

  let { newRank, inFeedRank } = await computeRank(metaPost, user);

  let feedObject = {
    post: post._id,
    rank: newRank,
    tweetDate: metaPost.latestTweet,
  };

  // make sure everyone gets it

  await TwitterFeed.update(
    { user: '_common_Feed_', metaPost: metaPost._id },
    feedObject,
    { upsert: true }
  ).exec();

  let updateAllUsers = allUsers.map(async u => {
    return await TwitterFeed.update(
      { user: u, metaPost: metaPost._id },
      feedObject,
      { upsert: true }
    ).exec();
  });

  await Promise.all(updateAllUsers);

  // update current user
  let userFeed = await TwitterFeed.findOneAndUpdate(
    { user: user._id, metaPost: metaPost._id },
    { ...feedObject, inTimeline: true, rank: inFeedRank },
    { upsert: true, new: true }
  );

  // update rank of existing posts
  await TwitterFeed.update(
    { metaPost: metaPost._id, inTimeline: true },
    { ...feedObject, rank: inFeedRank },
    { upsert: false, multi: true }
  );


  // if it doesn't - create post and upsert metapost
  // console.log('text ', tweet.full_text);
  // console.log('truncated ', tweet.truncated);
  // console.log('urls ', tweet.entities.urls);
  // console.log('entities ', tweet.entities);
  // console.log('user', tweet.user.screen_name);
  // console.log('retweet', tweet.retweet_count);
  // console.log('fav', tweet.favorite_count);
}

async function getUserFeed(user) {
  const client = new Twitter({
    consumer_key: process.env.TWITTER_ID,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token_key: user.twitterAuthToken,
    access_token_secret: user.twitterAuthSecret
  });

  // console.log(user.lastTweetId.toString());

  const params = {
    since_id: user.lastTweetId ? user.lastTweetId.toString() : undefined,
    screen_name: user.twitterHandle,
    exclude_replies: true,
    // include_entities: true,
    tweet_mode: 'extended'
  };
  let feed = await client.get('statuses/home_timeline', params);

  if (feed && feed.length) {
    // let lastId = feed[feed.length - 1].id;
    let lastId = feed[0].id;

    console.log('last id ', lastId);

    user.lastTweetId = lastId;
    user = await user.save();
    console.log(user.lastTweetId);
  }

  if (!feed) feed = [];

  feed.map(tweet => {
    q.push(async cb => {
      try {
        let post = await processTweet(tweet, user);
        cb();
      } catch (err) {
        console.log(err);
      }
    });
  });
  return feed;
}


async function getUsers(userId) {
  try {
    let query = userId ? { _id: userId } : {};
    let users = await User.find(
      { twitterHandle: { $exists: true }, ...query },
      'twitterAuthToken twitterAuthSecret twitterHandle lastTweetId relevance'
    );

    let treasury = await Treasury.findOne();

    let now = new Date();
    let lastUpdate = treasury.lastTwitterUpdate ? treasury.lastTwitterUpdate.getTime : 0;
    let decay = (now.getTime() - lastUpdate) / TWITTER_DECAY;
    console.log(decay);

    avgTwitterScore = treasury.avgTwitterScore * (1 - Math.min(1, decay)) || 0;
    twitterCount = treasury.twitterCount * (1 - Math.min(1, decay)) || 0;

    console.log('avg score from db ', avgTwitterScore);
    console.log('avg count from db ', twitterCount);

    allUsers = users.map(u => u._id);

    let processedUsers = users.map(async u => {
      try {
        return await getUserFeed(u);
      } catch (err) {
        console.log(err);
      }
    });

    await Promise.all(processedUsers);

    q.start(async (queErr, results) => {
      try {
        if (queErr) return console.log(queErr);

        treasury.twitterCount = twitterCount;
        treasury.avgTwitterScore = avgTwitterScore;
        treasury.lastTwitterUpdate = new Date();

        console.log('new avg score from db ', avgTwitterScore);
        console.log('new count from db ', twitterCount);

        await treasury.save();

        return console.log('finished processing tweets');
      } catch (err) {
        console.log(err);
      }
    });

  } catch (err) {
    console.log(err);
  }
}


getUsers();
module.exports = {
  updateTwitterPosts: getUsers
};

