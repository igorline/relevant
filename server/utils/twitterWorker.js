import { promisify } from 'util';
import request from 'request';
import Meta from '../api/metaPost/metaPost.model';
import Post from '../api/post/post.model';
import * as proxyHelpers from '../api/post/html';
import { text } from '../../app/utils';
import * as postController from '../api/post/post.controller';
import TwitterFeed from '../api/twitterFeed/twitterFeed.model';

let requestAsync = promisify(request);

const TENTH_LIFE = 3 * 24 * 60 * 60 * 1000;


const Twitter = require('twitter');
const User = require('../api/user/user.model');
const queue = require('queue');


// Post.find({ twitter: true }).remove().exec();

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





async function processTweet(tweet, user) {
  if (!tweet.entities.urls.length || !tweet.entities.urls[0].url) {
    return;
  }
  let originalTweet = tweet;
  if (tweet.retweeted_status) {
    tweet = tweet.retweeted_status;
  }


  // check if tw post exists
  // if it does, update feed and increment 'seen in feed counter'
  let post = await Post.findOne({ twitter: true, twitterId: tweet.id });
  let metaPost;
  if (post) {
    metaPost = await Meta.findOne({ _id: post.metaPost });
    if (metaPost) metaPost.seenInFeedNumber += 1;
    await metaPost.save();
  } else {
    let processed = await postController.previewDataAsync(tweet.entities.urls[0].expanded_url);

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
      body: tweet.full_text,
      keywords: processed.keywords,
      tags,
      postDate: originalTweet.created_at,

      embeddedUser: {
        name: tweet.user.name,
        id: tweet.user.screen_name,
        image: tweet.user.profile_image_url_https
      },
      twitterUser: tweet.user.id,
      twitterId: tweet.id,
      twitterRetweets: tweet.retweet_count,
      twitterFavs: tweet.favorite_count,
      // TODO do we know user? use relevance!
      relevance: tweet.retweet_count + tweet.favorite_count,
      rankRelevance: tweet.retweet_count + tweet.favorite_count,
      twitter: true,
      category: [],
    });
    // console.log(post);
    metaPost = await post.upsertMetaPost();
    post.metaPost = metaPost._id;
    await post.save();
  }


  let rank = metaPost.twitterScore;
  let newRank = (metaPost.latestTweet.getTime() / TENTH_LIFE) + Math.log10(rank + 1);
  let inFeedRank = (metaPost.latestTweet.getTime() / TENTH_LIFE) + Math.log10(10 * (rank + 1));
  rank = Math.round(newRank * 1000) / 1000;

  console.log(metaPost.twitterScore);
  console.log(metaPost.latestTweet);
  console.log(rank);

  let feedObject = {
    post: post._id,
    rank,
    tweetDate: metaPost.latestTweet,
  };

  // make sure everyone gets it

  await TwitterFeed.update(
    { user: '_common_Feed_', metaPost: metaPost._id },
    feedObject,
    { upsert: true }
  ).exec();

  // update current user
  let userFeed = await TwitterFeed.findOneAndUpdate(
    { user: user._id, metaPost: metaPost._id },
    { ...feedObject, inTimeline: true, rank: rank * 10 },
    { upsert: true, new: true }
  );
  console.log(userFeed);

  // update rank of existing posts
  await TwitterFeed.update(
    { metaPost: metaPost._id, inTimeline: true },
    { ...feedObject, rank: rank * 10 },
    { upsert: true, multi: true }
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

  const params = { screen_name: user.twitterHandle, exclude_replies: true, tweet_mode: 'extended' };
  let feed = await client.get('statuses/home_timeline', params);
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

async function getUsers() {
  try {
    let users = await User.find(
      { twitterHandle: { $exists: true } },
      'twitterAuthToken twitterAuthSecret twitterHandle'
    );

    let processedUsers = users.map(async u => {
      try {
        return await getUserFeed(u);
      } catch (err) {
        console.log(err);
      }
    });

    await Promise.all(processedUsers);

    q.start((queErr, results) => {
      if (queErr) return console.log(queErr);
      return console.log('finished processing tweets');
    });

  } catch (err) {
    // console.log(err);
  }
}

// getUsers();

