import PostData from 'server/api/post/postData.model';
import { MINIMUM_RANK } from 'server/config/globalConstants';
import Feed from './communityFeed.model';
import Post from '../post/post.model';

exports.get = async (req, res, next) => {
  try {
    // TODO - right now sorting commentary by latest and relevance
    // only works for community's own posts
    // solution: populate postData then populate with postData post
    // TODO - for now isolate commentary to given community
    const { community } = req.query;
    const { user } = req;

    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 5;
    const tag = req.query.tag || null;
    const { sort } = req.query;
    let sortQuery;
    let commentarySort;

    let query = { community, isInFeed: true };
    if (sort === 'rank') {
      sortQuery = { rank: -1 };
      query.pagerank = { $gt: MINIMUM_RANK };
      commentarySort = { pagerank: -1 };
    } else {
      sortQuery = { latestComment: -1 };
      commentarySort = { postDate: -1 };
    }

    let blocked = [];
    if (req.user) {
      blocked = [...(req.user.blocked || []), ...(req.user.blockedBy || [])];
    }

    if (tag) query = { ...query, tags: tag };

    const feed = await PostData.find(query)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'post',
      populate: [
        { path: 'data', match: { community } },
        {
          path: 'commentary',
          match: {
            // TODO implement intra-community commentary
            community,
            type: 'post',

            // TODO - we should probably sort the non-community commentary
            // with some randomness on client side
            // repost: { $exists: false },
            user: { $nin: blocked },
            hidden: { $ne: true }
          },
          options: { sort: commentarySort },
          populate: [
            { path: 'data' },
            {
              path: 'embeddedUser.relevance',
              select: 'pagerank',
              match: { community, global: true }
            }
          ]
        },
        { path: 'metaPost' },
        {
          path: 'embeddedUser.relevance',
          select: 'pagerank',
          match: { community, global: true }
        }
      ]
    });

    // console.log(feed)

    const posts = [];
    feed.forEach(async f => {
      if (f.post) {
        // if (f.post.commentary.length && f.post.commentary.find(p => p.twitter)) {
        //   console.log(f.post.toObject());
        // }
        posts.push(f.post);
      } else {
        // just in case - this shouldn't happen
        console.log('error: post is null!', f.toObject()); // eslint-disable-line
        await f.remove();
      }
    });

    // TODO worker thread?
    if (user) {
      const postIds = [];
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
    next(err);
  }
};

exports.getOld = async (req, res, next) => {
  try {
    // TODO - right now sorting commentary by latest and relevance
    // only works for community's own posts
    // solution: populate postData then populate with postData post
    // TODO - for now isolate commentary to given community
    const { community } = req.query;
    const { user } = req;

    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 5;
    const tag = req.query.tag || null;
    const { sort } = req.query;
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
      blocked = [...(req.user.blocked || []), ...(req.user.blockedBy || [])];
    }

    let query = { community, post: { $exists: true } };

    if (tag) query = { tags: tag, community };

    const feed = await Feed.find(query)
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
            $or: [{ hidden: { $ne: true } }]
          },
          options: { sort: commentarySort },
          populate: [
            { path: 'data' },
            {
              path: 'embeddedUser.relevance',
              select: 'pagerank',
              match: { community, global: true }
            }
          ]
        },
        { path: 'metaPost' },
        {
          path: 'embeddedUser.relevance',
          select: 'pagerank',
          match: { community, global: true }
        }
      ]
    });

    const posts = [];
    feed.forEach(async f => {
      if (f.post) {
        posts.push(f.post);
      } else {
        // just in case - this shouldn't happen
        console.log('error: post is null!'); // eslint-disable-line
        // await f.remove();
      }
    });

    // TODO worker thread?
    if (user) {
      const postIds = [];
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
    next(err);
  }
};
