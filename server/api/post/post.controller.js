import { promisify } from 'util';

import url from 'url';
import request from 'request';
import { EventEmitter } from 'events';
import * as proxyHelpers from './html';
import MetaPost from '../links/link.model';
import Relevance from '../relevance/relevance.model';

import Post from './post.model';
import User from '../user/user.model';
import PostData from './postData.model';

import Subscriptiton from '../subscription/subscription.model';
import Feed from '../feed/feed.model';
import Tag from '../tag/tag.model';
import apnData from '../../pushNotifications';
import mail from '../../mail';
import Notification from '../notification/notification.model';
import Invest from '../invest/invest.model';

import { PAYOUT_TIME } from '../../config/globalConstants';

let requestAsync = promisify(request);


// Post.collection.dropIndex({ url: 1 }, function(err, result) {
//     if (err) {
//         console.log('Error in dropping index!', err);
//     }
// });

// PostData.collection.dropIndex({ post: 1 }, function(err, result) {
//     if (err) {
//         console.log('Error in dropping index!', err);
//     }
// });

async function findRelatedPosts(metaId) {
  try {
    // let id = '598e2f3733b0985433527b95';
    let post = await MetaPost.findOne({ _id: metaId }).populate('tags');
    let tagsArr = post.tags.filter(t => !t.category).map(t => t._id);
    let tags = tagsArr.join(' ');
    let keywords = post.keywords.join(' ');
    let search = `${tags} ${keywords} ${post.title}`.replace(/"|'/g, '');

    let posts = await MetaPost.find(
      { $text: { $search: search }, _id: { $ne: metaId } },
      { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);
    posts.forEach((p, i) => {
      console.log(i, ' ' + p.title);
    });
    return posts;
  } catch (err) {
    console.log(err);
  }
}
// findRelatedPosts();

const PostEvents = new EventEmitter();

request.defaults({ maxRedirects: 22, jar: true });

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return (err) => {
    // throw err;
    res.status(statusCode).json({ message: err.message });
  };
}

exports.topPosts = async (req, res) => {
  let community = req.query.community;
  let posts;
  try {
    let now = new Date();
    now.setDate(now.getDate() - 7);
    posts = await Post.find({ createdAt: { $gt: now } })
    .populate({
      path: 'embeddedUser.relevance',
      match: { community, global: true },
      select: 'relevance'
    })
    .sort('-relevance').limit(20);

    res.status(200).json(posts);
  } catch (err) {
    handleError(res)(err);
  }
};

exports.sendPostNotification = async (req, res) => {
  // todo: add tweet option
  try {
    let post = req.body;
    let users = await User.find({});

    let alert = `In case you missed this top-ranked post from @${post.user}: ${post.title}`;
    let payload = {
      type: 'postLink',
      _id: post._id,
      title: post.title,
    };

    // TODO - optimize this or put in queu so we don't create a bottle neck;
    let finished = users.map(async user => {
      try {
        await apnData.sendNotification(user, alert, payload);
      } catch (err) {
        console.log('sending notifications error ', err);
      }
      return Notification.createNotification({
        post: post._id,
        forUser: user._id,
        byUser: post.user,
        type: 'topPost',
      });
    });
    await Promise.all(finished);
  } catch (err) {
    handleError(res)(err);
  }
  res.status(200).json({ success: true });
};

async function sendFlagEmail() {
  let status;
  try {
    let flaggedUrl = `${process.env.API_SERVER}/admin/flagged`;
    let data = {
      from: 'Relevant <noreply@mail.relevant.community>',
      to: 'contact@4real.io',
      subject: 'Inapproprate Content',
      html: `Someone has flagged a post for inappropriate content
      <br />
      <br />
      You can manage flagged content here:&nbsp;
      <a href="${flaggedUrl}" target="_blank">${flaggedUrl}</a>
      <br />
      <br />`
    };
    status = await mail.send(data);
  } catch (err) {
    console.log('mail error ', err);
    throw err;
  }
  return status;
}

exports.flag = async (req, res) => {
  let post;
  try {
    let userId = req.user._id;
    let postId = req.body.postId;
    post = await Post.findOneAndUpdate(
      { _id: postId },
      { flagged: true, $addToSet: { flaggedBy: userId }, flaggedTime: Date.now() },
      { new: true }
    );
    await MetaPost.findOneAndUpdate(
      { _id: post.metaPost },
      { flagged: true, $addToSet: { flaggedBy: userId }, flaggedTime: Date.now() },
      { new: true }
    );
    await sendFlagEmail();
  } catch (err) {
    handleError(res)(err);
  }
  res.status(200).json(post);
};

exports.index = async (req, res) => {
  let id;
  if (req.user) id = req.user._id;
  let community = req.query.community;
  let limit = parseInt(req.query.limit, 10) || 15;
  let skip = parseInt(req.query.skip, 10) || 0;
  let tags = req.query.tag || null;
  let sort = req.query.sort || null;
  let category = req.query.category || null;
  if (category === '') category = null;
  let query = null;
  let tagsArr = null;
  let posts;
  let sortQuery = { postDate: -1 };
  if (sort === 'rank') sortQuery = { rank: -1 };
  if (tags) {
    tagsArr = tags.split(',').trim();
    query = { $or: [{ tags: { $in: tagsArr } }, { category: { $in: tagsArr } }] };
    // if (category) query = { $or: [{ category }, query] };
  } else if (category) query = { category };

  try {
    posts = await Post.find(query)
    .populate({
      path: 'embeddedUser.relevance',
      select: 'relevance',
      match: { community, global: true },
    })
    .limit(limit)
    .skip(skip)
    .sort(sortQuery);

    res.status(200).json(posts);
  } catch (err) {
    return handleError(res)(err);
  }

  // TODO worker thread?
  // This code sends out upvote info to user (to display what posts the users has and hasn't upvoted)
  if (id) {
    let postIds = [];
    posts.forEach(post => {
      postIds.push(post._id || post);
    });
    Post.sendOutInvestInfo(postIds, id);
  }
  return null;
};

exports.userPosts = async (req, res, next) => {
  try {
    let community = req.query.community;
    let id;
    let blocked = [];
    if (req.user) {
      let user = req.user;
      blocked = [...user.blocked, ...user.blockedBy];
      id = req.user._id;
    }
    let limit = parseInt(req.query.limit, 10);
    let skip = parseInt(req.query.skip, 10);
    let userId = req.params.id || null;
    let sortQuery = { _id: -1 };
    let query = { user: userId, type: { $ne: 'comment' } };
    let posts;

    if (blocked.find(u => u === userId)) {
      return res.status(200).json({});
    }

    posts = await Post.find(query)
    .populate({
      path: 'repost.post',
      populate: [{
        path: 'embeddedUser.relevance',
        select: 'relevance',
        match: { community, global: true },
      }, {
        path: 'metaPost'
      }]
    })
    .populate({ path: 'metaPost ' })
    .populate({
      path: 'embeddedUser.relevance',
      select: 'relevance',
      match: { community, global: true },
    })
    .limit(limit)
    .skip(skip)
    .sort(sortQuery);

    res.status(200).json(posts);

    // TODO worker thread
    if (id) {
      let postIds = [];
      posts.forEach(post => {
        postIds.push(post._id || post);
        if (post.repost && post.repost.post) {
          postIds.push(post.repost.post._id);
        }
      });
      Post.sendOutInvestInfo(postIds, id);
    }
  } catch (err) {
    next(err);
  }
};

exports.preview = async (req, res) => {
  try {
    let urlParts = url.parse(req.url, false);
    let query = urlParts.query;
    let previewUrl = decodeURIComponent(query.replace('url=', ''));
    let result = await exports.previewDataAsync(previewUrl);
    return res.status(200).json(result);
  } catch (err) {
    handleError(res)(err);
  }
};


exports.previewDataAsync = async previewUrl => {

  if (!previewUrl.match(/http:\/\//i) && !previewUrl.match(/https:\/\//i)) {
    previewUrl = 'http://' + previewUrl;
  }

  function getHeader(uri) {
    let fbHeader = {
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php) Facebot',
    };
    let noFb = uri.match('apple.news'); // || uri.match('flip.it');
    if (noFb) return {};
    return fbHeader;
  }

  // recursive fuction TODO - max recursive calls check?
  async function queryUrl(_url) {
    let response = await requestAsync({
      url: _url,
      maxRedirects: 22,
      jar: true,
      gzip: true,
      headers: getHeader(_url),
      rejectUnauthorized: false,
      timeout: 20000,
      pool: { maxSockets: 1000 }
    });

    let uri = response.request.uri.href;
    let processed = await proxyHelpers.generatePreview(response.body, uri, _url);

    if (processed.redirect && processed.uri) {
      console.log('redirect ', processed.uri);
      uri = processed.uri;
      return await queryUrl(uri);
    }
    return Promise.resolve(processed.result);
  }

  // Its a PDF
  if (previewUrl.match('.pdf')) {
    return {
      url: previewUrl,
      title: previewUrl.substring(previewUrl.lastIndexOf('/') + 1),
      domain: proxyHelpers.extractDomain(previewUrl)
    };
  }

  return await queryUrl(previewUrl);
};

// async function test() {
//   try {
//     let result = await exports.previewDataAsync('https://t.co/1jMhfIuh0p');
//     console.log(result);
//   } catch (err) {
//     console.log(err);
//   }
// }
// test();



exports.readable = async (req, res) => {
  let short;
  let article;
  try {
    let uri = req.query.uri;
    article = await proxyHelpers.getReadable(uri);
    short = proxyHelpers.trimToLength(article.article, 140);
  } catch (err) {
    return handleError(res)(err);
  }
  return res.send(article.content);
};

exports.findById = async req => {
  let community = req.query.community;
  let id;
  let user = req.user;
  let post;

  if (user) id = req.user._id;
  let blocked = [];
  if (user) blocked = [...user.blocked, ...user.blockedBy];

  post = await Post.findOne({ _id: req.params.id, user: { $nin: blocked } })
  .populate({
    path: 'embeddedUser.relevance',
    select: 'relevance',
    match: { community, global: true },

  })
  .populate({ path: 'metaPost' });

  // TODO worker thread
  // TODO check if we recieve this in time for server rendering!
  if (id && post) {
    Post.sendOutInvestInfo([post._id], id);
  }

  console.log(post);
  // let related = await findRelatedPosts(post.metaPost);
  // return { post, related };
  return post;
};

exports.related = async req => {
  let id = req.params.id;
  return await findRelatedPosts(id);
};

exports.update = async (req, res, next) => {
  try {
    let tags = req.body.tags.filter(tag => tag);

    // DEPRECATED old mobile
    tags = tags.map(tag => tag.replace('_category_tag', '').trim());

    let mentions = req.body.mentions || [];
    let newMentions;
    let newTags;
    let category = req.body.category;
    let newPost;
    let linkObject;

    newPost = await Post.findOne({ _id: req.body._id });
    let prevMentions = [...newPost.mentions];

    newMentions = mentions.filter(m => prevMentions.indexOf(m) < 0);

    newPost.tags = tags;
    newPost.mentions = mentions;
    newPost.body = req.body.body;

    if (newPost.link !== req.body.link) {
      linkObject = {
        url: req.body.link,
        title: req.body.title || null,
        description: req.body.description || null,
        image: req.body.image || null,
        articleAuthor: req.body.articleAuthor,
        shortText: req.body.shortText,
        categories: [category],
        domain: req.body.domain
      };

      // let oldParentId = newPost.parentPost;
      let oldLinkParent = newPost.linkParent;

      // upsert new parent post
      newPost = await newPost.upsertLinkParent(linkObject);

      // update old parent post & feeds
      await Post.updateFeedStatus(oldLinkParent, newPost.community);
    }

    await newPost.save();
    res.status(200).json(newPost);

    // some post processing
    newTags = newTags || [];
    newMentions = newMentions || [];

    // TODO redo tag processing stuff
    let pTags = newTags.map(tag =>
      Tag.update(
        { _id: tag },
        { $addToSet:
          { parents: category },
          $inc: { count: 1 }
        },
        { upsert: true }
      ).exec()
    );

    let pMentions = Post.sendOutMentions(
      newMentions,
      newPost,
      { _id: newPost.user, name: newPost.embeddedUser.name }
    );

    return await Promise.all([...pTags, ...pMentions]);
  } catch (err) {
    next(err);
  }
};


async function processSubscriptions(newPost) {
  try {
    let author = newPost.embeddedUser;
    let subscribers = await Subscriptiton.find({
      following: newPost.user,
      // category: newPostObj.category
    })
    .populate('follower', '_id deviceTokens badge lastFeedNotification');

    let promises = subscribers.map(async subscription => {
      if (!subscription.follower) return null;
      try {
        let updateFeed;
        /**
         * In case subscription has expired, but user hasn't seen the articles
         * remove oldest unread in feed and push new one
         */
        // console.log(subscription);
        // // NO SUBSCRIPTIONS RN
        // if (subscription.amount < 1) {
        // check unread here
        // updateFeed = await Feed.processExpired(subscription.follower._id);
        // }
        if (!updateFeed && subscription.amount < 1) {
          return await subscription.remove();
        }

        subscription.amount -= 1;
        subscription.amount = Math.max(subscription.amount, 0);
        await subscription.save();

        let feed = new Feed({
          userId: subscription.follower,
          from: newPost.user,
          post: newPost._id,
          tags: newPost.tags,
          createdAt: new Date()
        });

        await feed.save();

        let now = new Date();

        let follower = subscription.follower;
        // TODO put it on a queue, only certain hours of the day
        if (now - (12 * 60 * 60 * 1000) > new Date(follower.lastFeedNotification)) {
          let unread = await Feed.find({
            userId: follower._id,
            read: false,
            createdAt: { $gte: now - (24 * 60 * 60 * 1000) }
          });
          let n = unread.length;
          await Feed.update(
            { userId: follower._id, read: false },
            { read: true },
            { multi: true }
          );
          let alert;
          if (n === 1) {
            alert = 'There is a new post from ' + author.name + ' in your feed!';
          } else {
            let from = unread.map(el => el.from);
            from = [...new Set(from)];
            if (from.length === 1) {
              alert = 'There are new posts from ' + author.name + ' in your feed!';
            } else {
              alert = 'There are new posts from ' + author.name + ' and others in your feed!';
            }
          }
          let payload = {
            type: 'newFeedpost',
            id: newPost._id,
            author: author.name,
            number: n,
          };
          // console.log('New post in feed alert', alert);
          apnData.sendNotification(follower, alert, payload);
          follower.lastFeedNotification = now;
          follower.save();
        } else {
          console.log('recently sent notification');
        }

        let newFeedPost = {
          _id: subscription.follower._id,
          type: 'INC_FEED_COUNT',
        };
        PostEvents.emit('post', newFeedPost);

      } catch (err) {
        console.log('error updating subscription ', err);
      }
    });
    await Promise.all(promises);
  } catch (err) {
    console.log('error processing subscriptions err');
  }
}

/**
 * Creates a new post
 */
exports.create = async (req, res, next) => {
  try {
    // TODO rate limiting
    // current rate limiting is 5s via invest

    // TODO fetch community id
    // let community = req.query.community || 'relevant';
    let { community, communityId } = req.communityMember;

    let mentions = req.body.mentions || [];
    let tags = [];
    let keywords = req.body.keywords || [];
    let category = req.body.category ? req.body.category._id : null;
    let author;

    let postUrl = req.body.url || req.body.link;
    let now = new Date();

    let payoutTime = new Date(now.getTime() + PAYOUT_TIME);
    if (process.env.NODE_ENV === 'test' && req.body.payoutTime) {
      payoutTime = req.body.payoutTime;
    }

    // TODO clean up tag stuff
    if (category) tags.push(category);
    // Deprecate this (old category tag stuff from mobile)
    req.body.tags.forEach(tag => {
      if (tag) {
        tags.push(tag.replace('_category_tag', '').trim());
      }
    });
    tags = [...new Set(tags)];
    // TODO work on & test tags & community tag stats!
    // async
    tags.map(tag =>
      Tag.update(
        { _id: tag },
        {
          $addToSet: { parents: category },
          $inc: { count: 1 },
        },
        { upsert: true }
      ).exec()
    );

    let linkObject = {
      // this is stored in metaPost
      url: postUrl,
      title: req.body.title ? req.body.title : '',
      description: req.body.description ? req.body.description : null,
      image: req.body.image ? req.body.image : null,
      articleAuthor: req.body.articleAuthor,
      shortText: req.body.shortText,
      keywords,
      domain: req.body.domain,
      categories: [category],
    };

    let newPostObj = {
      url: postUrl,
      title: req.body.title ? req.body.title : '',
      body: req.body.body ? req.body.body : null,
      tags,
      community,
      communityId,
      category,
      relevance: 0,
      user: req.user._id,
      mentions: req.body.mentions,
      postDate: now,
      payoutTime,
      eligibleForRewards: true,
    };

    // TODO Work on better length limits
    let postString = JSON.stringify(newPostObj);
    if (postString.length > 100000) {
      res.status(500).json('post is too long');
      return;
    }

    let newPost = new Post(newPostObj);

    author = await User.findOne({ _id: newPost.user });
    newPost = await newPost.addUserInfo(author);
    newPost = await newPost.addPostData();
    newPost = await newPost.save();

    if (postUrl) {
      console.log('inserting link parent ', postUrl);
      newPost = await newPost.upsertLinkParent(linkObject);
    } else {
      // TODO - do we want to put this into the ranked feed? maybe not...
      // await newPost.updateRank(newPost.community);
      await newPost.insertIntoFeed(newPost.community);
    }

    await author.updatePostCount();

    // creates an invest(vote) record for pots author
    // should we invest into parent post (link also)?
    await Invest.createVote({
      post: newPost,
      user: author,
      amount: 1,
      relevanceToAdd: 0,
    });

    res.status(200).json(newPost);

    processSubscriptions(newPost);
    // this happens async
    Post.sendOutMentions(mentions, newPost, author);
  } catch (err) {
    next(err);
  }
};


exports.delete = (req, res) => {
  let userId = req.user._id;
  let id = req.params.id;
  let query = { _id: id, user: userId };

  if (req.user.role === 'admin') {
    query = { _id: id };
  }

  Post.findOne(query)
  .then((foundPost) => {
    if (!foundPost) {
      res.json(404, 'no found post');
    } else {
      foundPost.remove((err) => {
        if (!err) {
          let newPostEvent = {
            type: 'REMOVE_POST',
            notMe: true,
            payload: foundPost
          };
          PostEvents.emit('post', newPostEvent);
          req.user.updatePostCount();
          res.status(200).json('removed');
        } else {
          res.status(404).json('deletion error');
        }
      });
    }
  });
};

exports.PostEvents = PostEvents;
