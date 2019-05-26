import createTweetPost from 'server/twitter/postFromTweet';
import Twitter from 'twitter';
import Community from 'server/api/community/community.model';
import Post from 'server/api/post/post.model';

const client = new Twitter({
  consumer_key: process.env.TWITTER_ID,
  consumer_secret: process.env.TWITTER_SECRET,
  bearer_token: process.env.TWITTER_BEARER
  // access_token_key: user.twitterAuthToken,
  // access_token_secret: user.twitterAuthSecret
});

const idRegex = /^\/(.*?)\/status\/([0-9]*)$/;

const testUrl = 'https://twitter.com/owocki/status/1132018365772341248';

// testTwitter();

// eslint-disable-next-line
async function testTwitter() {
  try {
    const testTweets = await Post.find({ type: 'twitterTest' });
    const removeTweets = testTweets.map(async t => t.remove());
    await Promise.all(removeTweets);
    const c = await Community.findOne({ slug: 'crypto' });

    const [, , tweetId] = idRegex.exec(new URL(testUrl).pathname);
    const tweet = await client.get(`statuses/show.json?id=${tweetId}`, {
      tweet_mode: 'extended'
    });
    if (!tweetId) throw new Error(`Invalid tweet url "${testUrl}"`);

    getConversation({
      tweet,
      community: c.slug,
      communityId: c._id,
      isOriginalTweet: true
    });
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
}

async function getConversation({
  tweet,
  community,
  communityId,
  isOriginalTweet,
  parentPost,
  parentComment
}) {
  try {
    const username = tweet.user.screen_name;
    const tweetId = tweet.id_str;
    if (!community || !communityId) throw new Error('missing community');

    const params = {
      q: `to:${username} OR from:${username}`,
      tweet_mode: 'extended',
      since_id: tweetId,
      count: 300
      // result_type: 'popular'
    };

    const replies = await client.get('search/tweets', params);

    await findReplies({
      tweetId,
      tweets: replies.statuses,
      tweet,
      community,
      communityId,
      isOriginalTweet,
      parentPost,
      parentComment
    });

    // console.log(replyIndex);
  } catch (err) {
    console.log(err); // eslint-disable-line
  }
}

const replyIndex = {};

async function findReplies({
  tweetId,
  tweets,
  tweet,
  community,
  communityId,
  isOriginalTweet,
  parentPost,
  parentComment
}) {
  parentComment = await createTweetPost({
    tweet,
    community,
    communityId,
    isOriginalTweet,
    parentPost,
    parentComment
  });
  parentPost = parentPost || parentComment;
  const rep = tweets.filter(t => t.in_reply_to_status_id_str === tweetId);
  replyIndex[tweetId] = rep.map(async t => {
    await getConversation({
      community,
      communityId,
      tweet: t,
      parentPost,
      parentComment
    });
    // await findReplies({
    //   tweetId: t.id_str, tweets, tweet: t, parentPost, parentComment, community, communityId
    // });
    return t.id_str;
  });
  return Promise.all(replyIndex[tweetId]);
}
