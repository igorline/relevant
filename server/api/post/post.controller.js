import request from 'request';
import { EventEmitter } from 'events';
import * as proxyHelpers from './html';
import MetaPost from '../metaPost/metaPost.model';

import Post from './post.model';
import User from '../user/user.model';
import Subscriptiton from '../subscription/subscription.model';
import Feed from '../feed/feed.model';
import Tag from '../tag/tag.model';
import apnData from '../../pushNotifications';
import mail from '../../mail';

const PostEvents = new EventEmitter();

request.defaults({ maxRedirects: 20, jar: true });
// uniqueInvestments()
// function uniqueInvestments() {
//   Post.find({})
//   .then((posts) => {
//     posts.forEach((post) => {
//       post.investments = post.investments.filter((elem, pos, arr) => arr.indexOf(elem) === pos);
//       post.save()
//       .then(saved => console.log(saved.investments));
//     });
//   });
// }
// async function updateAllRank() {
//   // await MetaPost.update({}, { rank: 0 }, { multi: true });
//   let posts = await Post.find();
//   posts.forEach(post => {
//     post.save();
//   });
// }
// updateAllRank();

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return (err) => {
    console.log(err);
    res.status(statusCode).send(err);
  };
}

async function sendFlagEmail() {
  let status;
  try {
    let url = `${process.env.API_SERVER}/admin/flagged`;
    let data = {
      from: 'Relevant <noreply@mail.relevant.community>',
      to: 'contact@4real.io',
      subject: 'Innaproprate Content',
      html: `Someone has flagged a post for innapropriate content
      <br />
      <br />
      You can manage flagged content here:&nbsp;
      <a href="${url}" target="_blank">${url}</a>
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
      path: 'user',
      select: 'name image relevance',
    })
    .limit(limit)
    .skip(skip)
    .sort(sortQuery);

    res.status(200).json(posts);
  } catch (err) {
    return res.send(500, err);
  }

  // TODO worker thread
  if (id) {
    let postIds = [];
    posts.forEach(post => {
      postIds.push(post._id || post);
    });
    Post.sendOutInvestInfo(postIds, id);
  }
  return null;
};

exports.userPosts = async (req, res) => {
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
  let query = { user: userId };
  let posts;

  if (blocked.find(u => u === userId)) {
    return res.status(200).json({});
  }

  try {
    posts = await Post.find(query)
    .populate({
      path: 'repost.post',
      populate: {
        path: 'user',
        select: 'name image relevance',
      }
    })
    .populate({
      path: 'user',
      select: 'name image relevance',
    })
    .limit(limit)
    .skip(skip)
    .sort(sortQuery);
  } catch (err) {
    console.log(err);
    return res.send(500, err);
  }

  console.log('sending ', posts.length, ' posts');
  res.status(200).json(posts);

  // TODO worker thread
  console.log('get invest info', id);
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
  return null;
};



exports.preview = (req, res) => {
  let previewUrl = req.query.url;

  if (!previewUrl.match('http://') && !previewUrl.match('https://')) {
    previewUrl = 'http://' + previewUrl;
  }

  function getHeader(uri) {
    let fbHeader = {
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    };
    let noFb = uri.match('apple.news');
    if (noFb) return {};
    return fbHeader;
  }

  function processReturn(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.log('preview error ', error || response.body);
      return res.status(500).json(error);
    }

    let uri = response.request.uri.href;
    console.log(uri);

    let processed = proxyHelpers.generatePreview(body, uri);

    if (processed.redirect && processed.uri) {
      console.log('redirect ', processed.uri);
      uri = processed.uri;
      return request({
        url: uri,
        maxRedirects: 20,
        jar: true,
        gzip: true,
        headers: getHeader(uri)
      }, processReturn);
    }
    return res.status(200).json(processed.result);
  }

  return request({
    url: previewUrl,
    maxRedirects: 20,
    jar: true,
    gzip: true,
    headers: getHeader(previewUrl)
  }, processReturn);
};


exports.readable = async (req, res) => {
  let short;
  try {
    let uri = req.query.uri;
    let article = await proxyHelpers.getReadable(uri);
    short = proxyHelpers.trimToLength(article.article, 140);
  } catch (err) {
    return handleError(res)(err);
  }
  return res.send(short.innerHTML);
};

exports.findByID = async (req, res) => {
  let id;
  if (req.user) id = req.user._id;
  let post;

  try {
    let blocked = [];
    if (req.user) {
      let user = req.user;
      blocked = [...user.blocked, ...user.blockedBy];
    }

    post = await Post.findOne({ _id: req.params.id, user: { $nin: blocked } })
    .populate({
      path: 'user',
      select: 'name image relevance',
    });
  } catch (err) {
    return res.send(500, err);
  }

  res.status(200).json(post);
  // TODO worker thread
  if (id && post) {
    Post.sendOutInvestInfo([post._id], id);
  }
  return null;
};

exports.update = async (req, res) => {
  console.log('init update');
  let tags = req.body.tags.map(
    tag => tag.replace('_category_tag', '').trim()
  );
  let mentions = req.body.mentions;
  let newMentions;
  let newTags;
  let category = req.body.category;
  let newPost;

  try {
    newPost = await Post.findOne({ _id: req.body._id });
    let prevMentions = [...newPost.mentions];
    let prevTags = [...newPost.tags];
    newMentions = mentions.filter(m => prevMentions.indexOf(m) < 0);
    newTags = tags.filter(t => prevTags.indexOf(t) < 0);
    newPost.tags = tags;
    newPost.mentions = mentions;
    newPost.body = req.body.body;
    newPost.title = req.body.title;
    newPost = await newPost.save();
  } catch (err) {
    return handleError(res)(err);
  }
  console.log(newPost);
  res.status(200).json(newPost);

  try {
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

    newPost.upsertMetaPost(newPost.metaPost);

    let pMentions = Post.sendOutMentions(
      newMentions,
      newPost,
      { _id: newPost.user, name: newPost.embeddedUser.name },
      'post'
    );

    return await Promise.all([...pTags, ...pMentions]);
  } catch (err) {
    return console.log('tag or mentions error during post edit ', err);
  }
};


/**
 * Creates a new post
 */
exports.create = (req, res) => {
  let mentions = req.body.mentions;
  let category = req.body.category ? req.body.category._id : null;
  let categoryName = req.body.category ? req.body.category.categoryName : null;
  let categoryEmoji = req.body.category ? req.body.category.emoji : null;
  let tags = [];
  let keywords = req.body.keywords || [];
  req.body.tags.forEach(tag => {
    if (tag) {
      tags.push(tag.replace('_category_tag', '').trim());
    }
  });
  tags = [...new Set(tags)];
  let author;

  // console.log('Post category ', category);
  let link = req.body.link;

  let newPostObj = {
    link,
    body: req.body.body ? req.body.body : null,
    tags,
    tagsText: tags,
    title: req.body.title ? req.body.title : null,
    description: req.body.description ? req.body.description : null,
    image: req.body.image ? req.body.image : null,
    category,
    categoryName,
    categoryEmoji,
    relevance: 0,
    rankRelevance: 0,
    articleAuthor: req.body.articleAuthor,
    shortText: req.body.shortText,
    // value: 0,
    user: req.user._id,
    investments: [],
    comments: [],
    lastPost: [],
    mentions: req.body.mentions,
    postDate: new Date(),
    domain: req.body.domain,
    keywords
  };

  // TODO WHY?
  let postString = JSON.stringify(newPostObj);
  let newPost = null;
  if (postString.length > 100000) {
    res.status(500).json('post is too long');
    return;
  }

  let tagPromises = tags.map(tag =>
    Tag.update(
      { _id: tag },
      {
        $addToSet: { parents: category },
        // TODO increment tags that weren't there before
        $inc: { count: 1 },
      },
      { upsert: true }
    ).exec()
  );

  // TODO do we want to wait for this or do this async?
  Promise.all(tagPromises)
  .then(() => {
    newPost = new Post(newPostObj);
    return newPost;
  })

  // create and populate meta post
  .then(() => newPost.upsertMetaPost())
  .then((metaPost) => {
    newPost.metaPost = metaPost._id;
    return User.findOne({ _id: newPost.user });
  })
  .then((user) => {
    author = user;
    user.postCount++;
    newPost.embeddedUser = {
      name: user.name,
      image: user.image
    };
    return user.save();
  })
  .then(() => newPost.save())
  .then((savedPost) => {
    console.log('saved post ', savedPost._id);
    return Subscriptiton.find({
      following: newPost.user,
      // category: newPostObj.category
    })
    .populate('follower', '_id deviceTokens badge lastFeedNotification');
  })

  .then((subscribers) => {
    let promises = [];
    subscribers.forEach((subscription) => {
      if (subscription.amount < 1) {
        promises.push(subscription.remove());
      } else {
        subscription.amount -= 1;
        promises.push(subscription.save());

        let feed = new Feed({
          userId: subscription.follower,
          from: newPost.user,
          post: newPost._id,
          tags: newPost.tags,
          createdAt: new Date()
        });
        promises.push(
          feed.save()
          .then(() => {
            let now = new Date();
            let follower = subscription.follower;
            if (now - (24 * 60 * 60 * 1000) > follower.lastFeedNotification) {
              let alert = 'There is a new post from ' + author.name + ' in your inbox!';
              let payload = { 'New post from': author.name };
              apnData.sendNotification(follower, alert, payload);
              follower.lastFeedNotification = now;
              follower.save();
            }
          })
        );

        let newFeedPost = {
          _id: subscription.follower,
          type: 'INC_FEED_COUNT',
        };
        PostEvents.emit('post', newFeedPost);
      }
    });
    return Promise.all(promises);
  })
  .then(() => {
    res.status(200).json(newPost);
    return;
  })
  // this happens async
  .then(() => Post.sendOutMentions(mentions, newPost, author))
  .catch(handleError(res));
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
          console.log('REMOVING ', foundPost.title);
          PostEvents.emit('post', newPostEvent);
          res.json(200, 'removed');
        } else {
          res.json(404, 'deletion error');
        }
      });
    }
  });
};

exports.PostEvents = PostEvents;
