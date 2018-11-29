import Feed from './communityFeed.model';
import Post from '../post/post.model';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return (err) => {
    console.log(err);
    res.status(statusCode).send(err);
  };
}

// Feed.findOne({ metaPost: null }).then(console.log);

exports.get = async (req, res) => {
  try {
    // TODO - right now sorting commentary by latest and relevance
    // only works for community's own posts
    // solution: populate postData then populate with postData post
    // TODO - for now isolate commentary to given community
    let community = req.query.community;
    let user = req.user;

    let skip = parseInt(req.query.skip, 10) || 0;
    let limit = parseInt(req.query.limit, 10) || 5;
    let tag = req.query.tag || null;
    let sort = req.query.sort;
    let sortQuery;
    let commentarySort;

    if (sort === 'rank') {
      sortQuery = { rank: -1 };
      // commentarySort = { relevance: -1 };
      commentarySort = { pagerank: -1 };
    } else {
      sortQuery = { latestPost: -1 };
      commentarySort = { postDate: -1 };
    }

    let blocked = [];
    if (req.user) {
      blocked = [...req.user.blocked || [], ...req.user.blockedBy || []];
    }

    let query = { community, post: { $exists: true } };

    if (tag) query = { tags: tag, community };
    let feed;
    let posts = [];

    feed = await Feed.find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'post',
      populate: [
        { path: 'data' },
        {
          path: 'commentary',
          match: {
            // TODO implement intra-community commentary
            community,

            // TODO - we should probably sort the non-community commentary
            // with some randomness on client side
            repost: { $exists: false },
            user: { $nin: blocked },
            $or: [{ hidden: { $ne: true } }],
          },
          options: { sort: commentarySort },
          populate: [
            { path: 'data' },
            {
              path: 'embeddedUser.relevance',
              select: 'pagerank',
              match: { community, global: true },
            },
          ]
        },
        { path: 'metaPost' },
        {
          path: 'embeddedUser.relevance',
          select: 'pagerank',
          match: { community, global: true },
        },
      ]
    });

    feed.forEach(async (f) => {
      if (f.post) {
        if (!f.post.commentary.length && f.post.type === 'link') {
          console.log(f);
          await f.remove();
        }
        posts.push(f.post);
      } else {
        // just in case - this shouldn't happen
        console.log('error: post is null!');
        await f.remove();
      }
    });

    // TODO worker thread?
    if (user) {
      let postIds = [];
      posts.forEach(meta => {
        postIds.push(meta._id);
        meta.commentary.forEach(post => {
          postIds.push(post._id || post);
        });
      });
      Post.sendOutInvestInfo(postIds, user._id);
    }

    res.status(200).json(posts);
  } catch (err) {
    handleError(res)(err);
  }
};

