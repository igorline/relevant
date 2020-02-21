import Post from '../post/post.model';
import Tag from './tag.model';

exports.update = async (req, res, next) => {
  let tag;
  const { newId } = req.body;
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
  } catch (err) {
    return next(err);
  }
  return res.status(200).json(tag);
};

exports.create = (req, res, next) => {
  const newTag = new Tag(req.body);
  newTag.save((err, tag) => {
    if (err) return next(err);
    return res.status(200).json(tag);
  });
};

exports.index = (req, res, next) => {
  const { sort } = req.query;
  let sortObj = null;

  if (sort === 'count') sortObj = { count: -1 };

  Tag.find()
    .sort(sortObj)
    .exec((err, tags) => {
      if (err) return next(err);
      return res.json(200, tags);
    });
};

exports.categories = (req, res, next) => {
  const { active } = req.query;
  let query = { category: true };
  if (active !== undefined) query = { category: true, active: true };

  Tag.find(query)
    .sort({ count: -1 })
    .then(categories => res.status(200).json(categories))
    .catch(next);
};

exports.search = (req, res, next) => {
  const { term } = req.params;
  Tag.find({
    _id: {
      $regex: term,
      $options: 'i'
    }
  })
    .then(foundTags => res.json(200, foundTags))
    .catch(next);
};
