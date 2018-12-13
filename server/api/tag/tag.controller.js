import Post from '../post/post.model';
import Relevance from '../relevance/relevance.model';
import Tag from './tag.model';


function handleError(res, statusCode) {
  const status = statusCode || 500;
  return (err) => {
    console.log('tag error ', err);
    res.status(status).send(err);
  };
}

// Tag.findOne({ _id: 'fashion'})
// .then(love => {
//   console.log(love)
//   love.emoji = '✌️';
//   // love.category = true;
//   // love.parents = [];
//   // love.main = ['sex', 'romance'];
//   // love.categoryName = 'Love';
//   love.save();
//   console.log(love)
// })

exports.update = async (req, res) => {
  let tag;
  const newId = req.body.newId;
  const oldId = req.body._id;
  let updatedTag = req.body;
  delete updatedTag.newId;
  try {
    if (newId !== oldId) {
      let sameIdTag = await Tag.findOne({ _id: newId });
      if (sameIdTag) {
        updatedTag.count = sameIdTag.count;
        updatedTag.parents = sameIdTag.parents;
        updatedTag = Math.max(sameIdTag.count, updatedTag.count);
        console.log('remove ', sameIdTag);
        sameIdTag = await sameIdTag.remove();
      }
    }

    tag = await Tag.findOneAndUpdate(
      { _id: oldId },
      { $set: { ...updatedTag } },
      { new: true }
    ).exec();

    if (newId !== oldId) {
      let newTag = new Tag({ ...tag.toObject(), _id: newId });
      // console.log('newTag ', newTag);
      newTag = await newTag.save();
      await tag.remove();
      tag = newTag;
    }

    console.log('new tag ', tag);

    await Post.update(
      { category: oldId },
      { $set: { category: newId } },
      { multi: true }
    ).exec();

    await Tag.update(
      { parents: oldId },
      { $addToSet: { 'parents.$': newId }, $pull: { 'parents.$': oldId } },
      { multi: true }
    ).exec();

    await Relevance.update(
      { category: oldId },
      { $set: { category: newId } },
      { multi: true }
    ).exec();

    await Relevance.update(
      { tag: oldId },
      { $set: { tag: newId } },
      { multi: true }
    ).exec();

    await Relevance.mergeDuplicates();
  } catch (err) { return handleError(res)(err); }
  return res.status(200).json(tag);
};

exports.create = (req, res) => {
  const newTag = new Tag(req.body);
  newTag.save((err, tag) => {
    if (err) return handleError(res)(err);
    return res.status(200).json(tag);
  });
};

exports.index = (req, res) => {
  const sort = req.query.sort;
  let sortObj = null;

  if (sort === 'count') sortObj = { count: -1 };

  Tag.find()
    .sort(sortObj)
    .exec((err, tags) => {
      if (err) return handleError(res)(err);
      return res.json(200, tags);
    });
};

exports.categories = (req, res) => {
  const active = req.query.active;
  let query = { category: true };
  if (active !== undefined) query = { category: true, active: true };

  Tag.find(query)
  // .sort('_id')
    .sort({ count: -1 })
    .then(categories => res.status(200).json(categories))
    .catch(err => handleError(res)(err));
};

exports.search = (req, res) => {
  const term = req.params.term;
  Tag.find({
    _id: {
      $regex: term,
      $options: 'i'
    }
  })
    .then(foundTags => res.json(200, foundTags))
    .catch(err => handleError(res)(err));
};

