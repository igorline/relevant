import Feed from './twitterFeed.model';
import Post from '../post/post.model';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return (err) => {
    console.log(err);
    res.status(statusCode).send(err);
  };
}

exports.get = async (req, res) => {
  let user = req.user._id;

  let skip = parseInt(req.query.skip, 10) || 0;
  let limit = parseInt(req.query.limit, 10) || 5;
  let tag = req.query.tag || null;
  let twitterUser = user;

  // let query = { user: { $in : [user, '_common_Feed_'] } };
  let query = { user, post: { $exists: true } };
  if (!req.user.twitterId) {
    twitterUser = '_common_Feed_';
  }
  query = { ...query, user: twitterUser };

  if (tag) query = { ...query, tags: tag, user };
  let feed;
  let posts = [];

  try {
    feed = await Feed.find(query)
    .sort({ rank: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'post',
      populate: [
        {
          path: 'commentary',
          match: { repost: { $exists: false } },
          options: { sort: { postDate: -1 } },
        },
        { path: 'metaPost' }
      ]
    });

    feed.forEach((f) => {
      if (f.post) posts.push(f.post);
      // console.log('title ', f.metaPost.title);
      // console.log('rank ', f.rank);
      // console.log('metapost rank ', f.metaPost.rank);
      // console.log('own ', f.inTimeline);
      // console.log('seen ', f.metaPost.seenInFeedNumber);
      // console.log('tw score ', f.metaPost.twitterScore);
    });

    // TODO worker thread?
    // TODO worker thread
    if (user) {
      let postIds = [];
      posts.forEach(p => {
        // console.log(p.commentary);
        p.commentary.forEach(post => {
          post.user = post.embeddedUser.id;
          postIds.push(post._id || post);
        });
      });
      Post.sendOutInvestInfo(postIds, user);
    }

    res.status(200).json(posts);
  } catch (err) {
    handleError(res)(err);
  }
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

