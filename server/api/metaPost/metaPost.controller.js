import MetaPost from './metaPost.model';
import Post from '../post/post.model';

// MetaPost.find({'commentary.1': {$exists: false}}).remove(() => {});

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}

// async function updateMetaPostRank() {
//   try {
//     let metas = await MetaPost.find({});
//     metas.forEach(async meta => {
//       try {
//         meta = await MetaPost.updateRank(meta._id);
//         console.log('new rank ', meta.rank);
//       } catch (err) {
//         console.log(err);
//       }
//     });
//   } catch (err) {
//     console.log(err);
//   }
// }
// updateMetaPostRank();

// async function populateMeta() {
//   let metas = await MetaPost.find().populate('commentary');
//   metas.forEach(meta => {
//     let tags = meta.tags || [];
//     let cats = meta.categories || [];
//     meta.commentary.forEach(post => {
//       tags = [...tags, ...post.tags];
//       cats = [...cats, post.category];
//     });
//     meta.tags = [...new Set(tags)];
//     meta.categories = [...new Set(cats)];
//     // console.log(tags);
//     // console.log(cats);
//     // console.log(meta);
//     meta.save();
//   });
// }
// populateMeta();

exports.index = async (req, res) => {
  let userId;
  let blocked = [];
  if (req.user) {
    userId = req.user._id;
    blocked = [...req.user.blocked, ...req.user.blockedBy];
  }

  let limit = parseInt(req.query.limit, 10) || 5;
  let skip = parseInt(req.query.skip, 10) || 0;
  let tags = req.query.tag || null;
  let sort = req.query.sort || null;
  let category = req.query.category || null;
  if (category === '') category = null;
  let query = null;
  let tagsArr = null;
  let sortQuery;
  let commentarySort = { postDate: -1 };
  let posts;

  if (sort === 'rank') {
    sortQuery = { rank: -1 };
    commentarySort = { rank: -1 };
  } else {
    sortQuery = { latestPost: -1 };
  }

  try {
    if (tags) {
      tagsArr = tags.split(',');
      query = { $or: [{ tags: { $in: tagsArr } }, { categories: { $in: tagsArr } }] };
    }

    posts = await MetaPost.find(query)
    // TODO - limit the commenatry and paginate / inf scroll it on backend
    .populate({
      path: 'commentary',
      // match: { user: { $nin: blocked } },
      match: { repost: { $exists: false }, user: { $nin: blocked } },
      options: { sort: commentarySort },
      populate: [
        {
          path: 'user',
          select: 'relevance name image'
        },
        {
          path: 'reposted',
          select: 'user embeddedUser',
          options: { sort: { _id: -1 } },
        }
      ]
    })
    .limit(limit)
    .skip(skip)
    .sort(sortQuery);
  } catch (err) {
    handleError(res, err);
  }

  console.log('sending ', posts.length, ' metaPosts');
  res.status(200).json(posts);

  // TODO worker thread
  if (userId) {
    let postIds = [];
    posts.forEach(meta => {
      meta.commentary.forEach(post => {
        postIds.push(post._id || post);
      });
    });
    Post.sendOutInvestInfo(postIds, userId);
  }
};

exports.flagged = async (req, res) => {
  let meta;
  try {
    meta = await MetaPost.find({ flagged: true })
    .sort({ flaggedTime: -1 })
    .populate({
      path: 'commentary',
      // match: { repost: { $exists: false } },
      options: { sort: { postDate: -1 } },
      populate: [
        {
          path: 'user',
          select: 'relevance name image'
        }
      ]
    });
  } catch (err) {
    handleError(res, err);
  }
  res.status(200).json(meta);
};

