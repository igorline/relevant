import Feed from './twitterFeed.model';

exports.get = async (req, res, next) => {
  try {
    const user = req.user._id;

    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 5;
    let twitterUser = user;

    // let query = { user: { $in : [user, '_common_Feed_'] } };
    let query = { user, post: { $exists: true } };
    if (!req.user.twitterId) {
      twitterUser = '_common_Feed_';
    }
    query = { ...query, user: twitterUser };

    const posts = [];

    const feed = await Feed.find(query)
    .sort({ rank: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'post',
      populate: [
        {
          path: 'commentary',
          match: { repost: { $exists: false } },
          options: { sort: { postDate: -1 } }
        },
        { path: 'metaPost' }
      ]
    });

    feed.forEach(f => {
      if (f.post) posts.push(f.post);
      // console.log('title ', f.metaPost.title);
      // console.log('rank ', f.rank);
      // console.log('metapost rank ', f.metaPost.rank);
      // console.log('own ', f.inTimeline);
      // console.log('seen ', f.metaPost.seenInFeedNumber);
      // console.log('tw score ', f.metaPost.twitterScore);
    });
    res.status(200).json(posts);
  } catch (err) {
    next(err);
  }
};

exports.unread = (req, res, next) => {
  let query = null;
  const userId = req.user._id;
  if (userId) {
    query = { userId, read: false };
  }
  Feed.count(query)
  .then(unread => {
    res.status(200).json({ unread });
  })
  .catch(next);
};

exports.markRead = (req, res, next) => {
  const query = { userId: req.user._id, read: false };
  return Feed.update(query, { read: true }, { multi: true })
  .then(() => res.status(200).send())
  .catch(next);
};

// for testing
exports.post = (req, res, next) => {
  const postId = req.params.id;
  Feed.find({ post: postId })
  .sort({ createdAt: -1 })
  // .populate('post')
  .then(feed => {
    res.status(200).json(feed);
  })
  .catch(next);
};
