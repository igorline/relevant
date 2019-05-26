import Post from 'server/api/post/post.model';
import Meta from 'server/api/post/link.model';
import PostData from 'server/api/post/postData.model';
import * as postController from 'server/api/post/post.controller';
import { PAYOUT_TIME } from 'server/config/globalConstants';

export default async function processTweet({
  tweet,
  communityId,
  isOriginalTweet,
  community,
  parentComment,
  parentPost
}) {
  const twitterScore = 2 * tweet.retweet_count + tweet.favorite_count;

  let post = await Post.findOne({
    twitter: true,
    twitterId: tweet.id
  }).populate({
    path: 'data',
    match: { communityId }
  });

  const payoutTime = new Date(new Date().getTime() + PAYOUT_TIME);

  if (post) {
    // post.parentComment = parentComment ? parentComment._id : null;
    // post.parentPost = parentPost ? parentPost._id : null;
    // post.community = community;
    // post.communityId = communityId;
    if (!post.data) {
      // this will add post to a new community
      post = await post.addPostData({
        communityId,
        community,
        payoutTime
      });
      if (isOriginalTweet) await post.insertIntoFeed({ community, communityId });
    }
    post.twitterScore = twitterScore;
    return post.save();
  }

  const shouldProcessUrl =
    isOriginalTweet &&
    tweet.entities.urls.length &&
    tweet.entities.urls[0].url &&
    !tweet.entities.urls[0].expanded_url.match('twitter.com');

  const tags = tweet.entities.hashtags.map(t => t.text);

  let body = tweet.full_text.replace(/&amp;/, '&');
  body = cleanUpTweetBody({ tweet, body });

  post = new Post({
    community,
    communityId,
    body,
    tags,
    payoutTime,
    postDate: tweet.created_at,
    embeddedUser: {
      handle: tweet.user.screen_name,
      name: tweet.user.name,
      _id: tweet.user.id,
      image: tweet.user.profile_image_url_https.replace('_normal', '')
    },
    twitterUser: tweet.user.id,
    twitterId: tweet.id,
    twitterScore,
    twitter: true,
    twitterUrl: tweet.entities.urls[0] ? tweet.entities.urls[0].expanded_url : null,
    parentComment: parentComment ? parentComment._id : null,
    parentPost: parentPost ? parentPost._id : null,
    type: 'twitterTest'
  });

  post = await post.addPostData();

  if (shouldProcessUrl) {
    const { linkObject, processed } = await createLinkObj(tweet);
    post.title = processed.title;
    post.image = processed.image;
    post.url = processed.url;
    post = await post.upsertLinkParent(linkObject);
  }

  const parentPostData =
    (parentPost && parentPost.data) ||
    (await PostData.findOne({ post: post.parentPost }));

  if (
    parentPostData &&
    (!parentPostData.latestPost || parentPostData.latestPost < post.postDate)
  ) {
    parentPostData.latestPost = post.postDate;
    await parentPostData.save();
  }

  if (isOriginalTweet) await post.insertIntoFeed({ community, communityId });
  return post.save();
}

function cleanUpTweetBody({ tweet, body }) {
  let offset = 0;
  if (tweet.entities.user_mentions) {
    tweet.entities.user_mentions.forEach(m => {
      if (m.indices[0] === offset) {
        offset = m.indices[1] + 1;
      }
    });
  }
  return body.slice(offset);
}

async function createLinkObj(tweet) {
  let processed = await Meta.findOne({
    twitterUrl: tweet.entities.urls[0].expanded_url
  });

  if (!processed) {
    const noReadability = true;
    processed = await postController.previewDataAsync(
      tweet.entities.urls[0].expanded_url,
      noReadability
    );
  }

  const linkObject = {
    title: processed.title,
    url: processed.url,
    description: processed.description,
    image: processed.image,
    articleAuthor: processed.articleAuthor,
    domain: processed.domain,
    // TODO we are not using this
    shortText: processed.shortText,
    keywords: processed.keywords
  };
  return { linkObject, processed };
}
