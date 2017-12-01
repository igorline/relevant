import Feed from './twitterFeed.model';
import MetaPost from '../metaPost/metaPost.model';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return (err) => {
    res.status(statusCode).send(err);
  };
}


exports.get = async (req, res) => {
  let user = req.user._id;

  let skip = parseInt(req.query.skip, 10) || 0;
  let limit = parseInt(req.query.limit, 10) || 5;
  let tag = req.query.tag || null;
  let query = { user: { $in : [user, '_common_Feed_'] } };
  if (tag) query = { tags: tag, user };
  let feed;
  let posts = [];

  try {
    feed = await Feed.find(query)
    .sort({ rank: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'metaPost',
      options: { sort: { relevance: -1 } },
      populate: [
        {
          path: 'twitterCommentary',
        },
      ]
    });

    feed.forEach((f) => {
      if (f.metaPost) posts.push(f.metaPost);
      console.log('title ', f.metaPost.title);
      console.log('rank ', f.rank);
      console.log('rank ', f.metaPost.rank);
      console.log('rank ', f.inTimeline);
      console.log('score ', f.metaPost.twitterScore);

    });
    res.status(200).json(posts);
  } catch (err) {
    handleError(res)(err);
  }

  // TODO worker thread?
  // if (user) {
  //   let postIds = [];
  //   posts.forEach(post => {
  //     postIds.push(post._id || post);
  //     if (post.repost && post.repost.post) {
  //       postIds.push(post.repost.post._id);
  //     }
  //   });
  //   Post.sendOutInvestInfo(postIds, user);
  // }
};

exports.unread = (req, res) => {
  let query = null;
  let userId = req.user._id;
  if (userId) {
    query = { userId, read: false };
  }
  Feed.count(query)
  .then((unread) => {
    res.status(200).json({ unread });
  });
};

exports.markRead = (req, res) => {
  let query = { userId: req.user._id, read: false };
  return Feed.update(query, { read: true }, { multi: true })
  .then(() => res.status(200).send())
  .catch(err => handleError(res, err));
};

// for testing
exports.post = (req, res) => {
  let postId = req.params.id;
  Feed.find({ post: postId })
      .sort({ createdAt: -1 })
      // .populate('post')
      .then(feed => {
        res.status(200).json(feed);
      })
      .catch(handleError(res));
};

