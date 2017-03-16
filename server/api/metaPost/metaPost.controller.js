import MetaPost from './metaPost.model';
import Post from '../post/post.model';

// MetaPost.find({'commentary.1': {$exists: false}}).remove(() => {});

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}

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
  if (req.user) userId = req.user._id;
  let limit = parseInt(req.query.limit, 10) || 5;
  let skip = parseInt(req.query.skip, 10) || 0;
  let tags = req.query.tag || null;
  let sort = req.query.sort || null;
  let category = req.query.category || null;
  if (category === '') category = null;
  let query = null;
  let tagsArr = null;
  let sortQuery = { _id: -1 };
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
      options: { sort: commentarySort },
      populate: [
        {
          path: 'user',
          select: 'relevance name image'
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

