// import { promisify } from 'util';
import url from 'url';
import request from 'request';
import { EventEmitter } from 'events';
import * as proxyHelpers from './html';
import MetaPost from './link.model';
import Post from './post.model';
import User from '../user/user.model';
import Subscriptiton from '../subscription/subscription.model';
import Feed from '../feed/feed.model';
import Tag from '../tag/tag.model';
import apnData from '../../pushNotifications';
import mail from '../../mail';
import Notification from '../notification/notification.model';
import Invest from '../invest/invest.model';

import { PAYOUT_TIME } from '../../config/globalConstants';

const { promisify } = require('util');


const requestAsync = promisify(request);
request.defaults({ maxRedirects: 22, jar: true });

const PostEvents = new EventEmitter();

async function findRelatedPosts(metaId) {
  try {
    const post = await MetaPost.findOne({ _id: metaId }).populate('tags');
    const tagsArr = post.tags.filter(t => !t.category).map(t => t._id);
    const tags = tagsArr.join(' ');
    const keywords = post.keywords.join(' ');
    const search = `${tags} ${keywords} ${post.title}`.replace(/"|'/g, '');

    const posts = await MetaPost.find(
      { $text: { $search: search }, _id: { $ne: metaId } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);
    return posts;
  } catch (err) {
    throw new Error(err);
  }
}

exports.topPosts = async (req, res, next) => {
  const { community } = req.query;
  let posts;
  try {
    const now = new Date();
    now.setDate(now.getDate() - 7);
    posts = await Post.find({ createdAt: { $gt: now } })
    .populate({
      path: 'embeddedUser.relevance',
      match: { community, global: true },
      select: 'pagerank'
    })
    .sort('-relevance')
    .limit(20);
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

exports.sendPostNotification = async (req, res, next) => {
  // todo: add tweet option
  try {
    const post = req.body;
    const users = await User.find({});

    const alert = `In case you missed this top-ranked post from @${post.user}: ${
      post.title
    }`;
    const payload = {
      type: 'postLink',
      _id: post._id,
      title: post.title
    };

    // TODO - optimize this or put in queue so we don't create a bottle neck;
    const finished = users.map(async user => {
      try {
        await apnData.sendNotification(user, alert, payload);
      } catch (err) {
        // eslint-disable-next-line
        console.log('sending notifications error ', err);
      }
      return Notification.createNotification({
        post: post._id,
        forUser: user._id,
        byUser: post.user,
        type: 'topPost'
      });
    });
    await Promise.all(finished);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

async function sendFlagEmail() {
  try {
    const flaggedUrl = `${process.env.API_SERVER}/admin/flagged`;
    const data = {
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
    return mail.send(data);
  } catch (err) {
    throw err;
  }
}

exports.flag = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId } = req.body;
    const post = await Post.findOneAndUpdate(
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
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};

exports.index = async (req, res, next) => {
  try {
    let id;
    if (req.user) id = req.user._id;
    const { community } = req.query;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = parseInt(req.query.skip, 10) || 0;
    const tags = req.query.tag || null;
    const sort = req.query.sort || null;
    let category = req.query.category || null;
    if (category === '') category = null;
    let query = null;
    let tagsArr = null;
    let sortQuery = { postDate: -1 };
    if (sort === 'rank') sortQuery = { rank: -1 };
    if (tags) {
      tagsArr = tags.split(',').trim();
      query = { $or: [{ tags: { $in: tagsArr } }, { category: { $in: tagsArr } }] };
      // if (category) query = { $or: [{ category }, query] };
    } else if (category) query = { category };

    const posts = await Post.find(query)
    .populate({
      path: 'embeddedUser.relevance',
      select: 'pagerank',
      match: { community, global: true }
    })
    .limit(limit)
    .skip(skip)
    .sort(sortQuery);

    res.status(200).json(posts);

    // TODO worker thread?
    // This code sends out upvote info to user
    // (to display what posts the users has and hasn't upvoted)
    if (id) {
      const postIds = [];
      posts.forEach(post => {
        postIds.push(post._id || post);
      });
      Post.sendOutInvestInfo(postIds, id);
    }
  } catch (err) {
    next(err);
  }
};

exports.userPosts = async (req, res, next) => {
  try {
    const { community } = req.query;
    const { user } = req;
    let id;
    let blocked = [];
    if (user) {
      blocked = [...user.blocked, ...user.blockedBy];
      id = user._id;
    }
    const limit = parseInt(req.query.limit, 10);
    const skip = parseInt(req.query.skip, 10);
    const userId = req.params.id || null;
    const sortQuery = { _id: -1 };
    const query = { user: userId, type: { $ne: 'comment' } };

    if (blocked.find(u => u === userId)) {
      return res.status(200).json({});
    }

    const posts = await Post.find(query)
    .populate({
      path: 'repost.post',
      populate: [
        {
          path: 'embeddedUser.relevance',
          select: 'pagerank',
          match: { community, global: true }
        },
        {
          path: 'metaPost'
        }
      ]
    })
    .populate({ path: 'metaPost ' })
    .populate({
      path: 'embeddedUser.relevance',
      select: 'pagerank',
      match: { community, global: true }
    })
    .populate({
      path: 'data',
      match: { community }
    })
    .limit(limit)
    .skip(skip)
    .sort(sortQuery);

    res.status(200).json(posts);

    // TODO worker thread?
    if (id) {
      const postIds = [];
      posts.forEach(post => {
        postIds.push(post._id || post);
        if (post.repost && post.repost.post) {
          postIds.push(post.repost.post._id);
        }
      });
      Post.sendOutInvestInfo(postIds, id);
    }
    return null;
  } catch (err) {
    return next(err);
  }
};

exports.preview = async (req, res, next) => {
  try {
    const urlParts = url.parse(req.url, false);
    const { query } = urlParts;
    const previewUrl = decodeURIComponent(query.replace('url=', ''));
    const result = await exports.previewDataAsync(previewUrl);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.previewDataAsync = async (previewUrl, noReadability) => {
  if (!previewUrl.match(/http:\/\//i) && !previewUrl.match(/https:\/\//i)) {
    previewUrl = 'http://' + previewUrl;
  }

  function getHeader(uri) {
    const fbHeader = {
      'User-Agent':
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php) Facebot'
    };
    const noFb = uri.match('apple.news') || uri.match('bloomberg.com');

    if (noFb) return {};
    return fbHeader;
  }

  // recursive fuction TODO - max recursive calls check?
  async function queryUrl(_url) {
    const response = await requestAsync({
      url: _url,
      maxRedirects: 22,
      jar: true,
      gzip: true,
      headers: getHeader(_url),
      rejectUnauthorized: false,
      timeout: 20000,
      pool: { maxSockets: 1000 },
      agent: false
    });

    let uri = response.request.uri.href;
    const processed = await proxyHelpers.generatePreview(
      response.body,
      uri,
      _url,
      noReadability
    );

    if (processed.redirect && processed.uri) {
      console.log('redirect ', processed.uri);
      uri = processed.uri;
      return queryUrl(uri);
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

  return queryUrl(previewUrl);
};

exports.readable = async (req, res, next) => {
  try {
    const { uri } = req.query;
    const article = await proxyHelpers.getReadable(uri);
    // let short = proxyHelpers.trimToLength(article.article, 140);
    res.send(article.content);
  } catch (err) {
    next(err);
  }
};

exports.findById = async req => {
  const { community } = req.query;
  let id;
  const { user } = req;

  if (user) id = user._id;
  let blocked = [];
  if (user) blocked = [...user.blocked, ...user.blockedBy];

  const post = await Post.findOne({ _id: req.params.id, user: { $nin: blocked } })
  .populate({
    path: 'embeddedUser.relevance',
    select: 'pagerank',
    match: { community, global: true }
  })
  .populate({ path: 'metaPost' })
  .populate({
    path: 'data',
    match: { community }
  });

  // TODO worker thread
  // TODO check if we recieve this in time for server rendering!
  if (id && post) {
    Post.sendOutInvestInfo([post._id], id);
  }
  // let related = await findRelatedPosts(post.metaPost);
  // return { post, related };
  return post;
};

// NOT USED RN
exports.related = async req => {
  const { id } = req.params;
  return findRelatedPosts(id);
};

exports.update = async (req, res, next) => {
  try {
    let tags = req.body.tags.filter(tag => tag);

    // DEPRECATED old mobile
    tags = tags.map(tag => tag.replace('_category_tag', '').trim());

    const mentions = req.body.mentions || [];
    let newMentions;
    let newTags;
    const { category } = req.body;
    let newPost;
    let linkObject;

    newPost = await Post.findOne({ _id: req.body._id });
    const prevMentions = [...newPost.mentions];
    const prevTags = [...newPost.mentions];

    newMentions = mentions.filter(m => prevMentions.indexOf(m) < 0);
    newTags = tags.filter(t => prevTags.indexOf(t) < 0);

    newPost.tags = tags;
    newPost.mentions = mentions;
    newPost.body = req.body.body;

    if (newPost.url !== req.body.url) {
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
      const oldLinkParent = newPost.linkParent;

      // upsert new parent post
      newPost = await newPost.upsertLinkParent(linkObject);

      // update old parent post & feeds
      await Post.updateFeedStatus(oldLinkParent, newPost);
    }

    await newPost.save();
    res.status(200).json(newPost);

    // some post processing
    newTags = newTags || [];
    newMentions = newMentions || [];

    // TODO redo tag processing stuff
    const pTags = newTags.map(tag =>
      Tag.update(
        { _id: tag },
        {
          $addToSet: { parents: category },
          $inc: { count: 1 } // eslint-disable-line
        },
        { upsert: true }
      ).exec()
    );

    const pMentions = Post.sendOutMentions(newMentions, newPost, {
      _id: newPost.user,
      name: newPost.embeddedUser.name
    });

    return await Promise.all([...pTags, ...pMentions]);
  } catch (err) {
    return next(err);
  }
};

async function processSubscriptions(newPost) {
  try {
    const author = newPost.embeddedUser;
    const subscribers = await Subscriptiton.find({
      following: newPost.user
      // category: newPostObj.category
    }).populate('follower', '_id deviceTokens badge lastFeedNotification');

    const promises = subscribers.map(async subscription => {
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
          return subscription.remove();
        }

        subscription.amount -= 1;
        subscription.amount = Math.max(subscription.amount, 0);
        await subscription.save();

        const feed = new Feed({
          userId: subscription.follower,
          from: newPost.user,
          post: newPost._id,
          tags: newPost.tags,
          createdAt: new Date()
        });

        await feed.save();

        const now = new Date();

        const { follower } = subscription;
        // TODO put it on a queue, only certain hours of the day
        if (now - 12 * 60 * 60 * 1000 > new Date(follower.lastFeedNotification)) {
          const unread = await Feed.find({
            userId: follower._id,
            read: false,
            createdAt: { $gte: now - 24 * 60 * 60 * 1000 }
          });
          const n = unread.length;
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
              alert =
                'There are new posts from ' + author.name + ' and others in your feed!';
            }
          }
          const payload = {
            type: 'newFeedpost',
            id: newPost._id,
            author: author.name,
            number: n
          };
          // console.log('New post in feed alert', alert);
          apnData.sendNotification(follower, alert, payload);
          follower.lastFeedNotification = now;
          follower.save();
        }

        const newFeedPost = {
          _id: subscription.follower._id,
          type: 'INC_FEED_COUNT'
        };
        PostEvents.emit('post', newFeedPost);
        return null;
      } catch (err) {
        // eslint-disable-next-line
        console.error('error updating subscription ', err);
        return null;
      }
    });
    await Promise.all(promises);
  } catch (err) {
    // eslint-disable-next-line
    console.error('error processing subscriptions', err);
  }
}

/**
 * Creates a new post
 */
exports.create = async (req, res, next) => {
  try {
    // TODO rate limiting?
    // current rate limiting is 5s via invest

    const { community, communityId } = req.communityMember;

    const mentions = req.body.mentions || [];
    let tags = [];
    const keywords = req.body.keywords || [];
    const category = req.body.category ? req.body.category._id : null;

    const postUrl = req.body.url || req.body.link;
    const now = new Date();

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
          $inc: { count: 1 }
        },
        { upsert: true }
      ).exec()
    );

    const linkObject = {
      // this is stored in metaPost
      url: postUrl,
      title: req.body.title ? req.body.title : '',
      description: req.body.description ? req.body.description : null,
      image: req.body.image ? req.body.image : null,
      articleAuthor: req.body.articleAuthor,
      shortText: req.body.shortText,
      keywords,
      domain: req.body.domain,
      categories: [category]
    };

    const newPostObj = {
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
      eligibleForRewards: true
    };

    // TODO Work on better length limits
    const postString = JSON.stringify(newPostObj);
    if (postString.length > 100000) {
      res.status(500).json('post is too long');
      return;
    }

    let newPost = new Post(newPostObj);

    const author = await User.findOne({ _id: newPost.user });
    newPost = await newPost.addUserInfo(author);
    newPost = await newPost.addPostData();
    newPost = await newPost.save();

    if (postUrl) {
      newPost = await newPost.upsertLinkParent(linkObject);
      await newPost.parentPost.insertIntoFeed(newPost.community);
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
      community,
      communityId
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
  const userId = req.user._id;
  const { id } = req.params;
  let query = { _id: id, user: userId };

  if (req.user.role === 'admin') {
    query = { _id: id };
  }

  Post.findOne(query).then(foundPost => {
    if (!foundPost) {
      res.json(404, 'no found post');
    } else {
      foundPost.remove(err => {
        if (!err) {
          const newPostEvent = {
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
