import MetaPost from './metaPost.model';
import Post from '../post/post.model';

// MetaPost.collection.dropIndexes(function (err, results) {
//   console.log(err);
// });

// MetaPost.collection.createIndex(
//   { title: 'text',
//     shortText: 'text',
//     description: 'text',
//     keywords: 'text',
//     tags: 'text'
//   },
//   {
//     weights: {
//       title: 1,
//       shortText: 1,
//       description: 1,
//       keywords: 2,
//       tags: 2,
//     },
//     name: 'TextIndex'
//   }
// );

// MetaPost.collection.indexes(function (err, indexes) {
//   console.log(indexes);
// });

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
//     // let tags = meta.tags || [];
//     // let cats = meta.categories || [];
//     let keywords = meta.keywords || [];
//     meta.commentary.forEach(post => {
//       // tags = [...tags, ...post.tags];
//       // cats = [...cats, post.category];
//       keywords = [...keywords, post.keywords];
//     });
//     // meta.tags = [...new Set(tags)];
//     // meta.categories = [...new Set(cats)];
//     meta.keywords = [...new Set(keywords)];
//     // console.log(tags);
//     // console.log(cats);
//     console.log(meta.keywords);
//     // meta.save();
//   });
// }
// populateMeta();

exports.related = async req => {
  let postId = req.params.id;
  let post = await MetaPost.findOne({ commentary: postId }).populate('tags');
  let tagsArr = post.tags.filter(t => !t.category).map(t => t._id);
  let tags = tagsArr.join(' ');
  let keywords = post.keywords.join(' ');
  let search = `${tags} ${keywords} ${post.title}`.replace(/"|'/g, '');

  let posts = await MetaPost.find(
    { $text: { $search: search }, _id: { $ne: post._id } },
    { score: { $meta: 'textScore' } })
  .sort({ score: { $meta: 'textScore' } })
  .limit(5);
  posts.forEach((p, i) => {
    console.log(i, ' ' + p.title);
    // console.log(p.description);
    // console.log(p.keywords);
  });
  return posts;
};


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
  let query = { twitter: { $ne: true } };
  let tagsArr = null;
  let sortQuery;
  let commentarySort = { postDate: -1 };
  let posts;

  if (sort === 'rank') {
    sortQuery = { rank: -1 };
    commentarySort = { relevance: -1 };
  } else {
    sortQuery = { latestPost: -1 };
  }

  try {
    if (tags) {
      tagsArr = tags.split(',');
      query = { twitter: { $ne: true }, $or: [{ tags: { $in: tagsArr } }, { categories: { $in: tagsArr } }] };
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

    // TODO worker thread?
    if (userId) {
      let postIds = [];
      posts.forEach(meta => {
        meta.commentary.forEach(post => {
          if (!post.user) post.user = post.embeddedUser.id;
          postIds.push(post._id || post);
        });
      });
      Post.sendOutInvestInfo(postIds, userId);
    }
  } catch (err) {
    handleError(res, err);
  }

  res.status(200).json(posts);
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

