import Post from '../post/post.model';
import Relevance from '../relevance/relevance.model';
import Tag from './tag.model';


function handleError(res, statusCode) {
  let status = statusCode || 500;
  return (err) => {
    console.log('tag error ', err);
    res.status(status).send(err);
  };
}

exports.update = async (req, res) => {
  let tag;
  let newId = req.body.newId;
  let oldId = req.body._id;
  let updatedTag = req.body;
  delete updatedTag.newId;
  try {
    if (newId !== oldId) {
      let sameIdTag = await Tag.findOne({ _id: newId });
      if (sameIdTag) {
        updatedTag.count = sameIdTag.count;
        updatedTag.parents = sameIdTag.parents;
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


    Post.update(
      { category: oldId },
      { $set: { category: newId } },
      { multi: true }
    ).exec();

    Tag.update(
      { parents: oldId },
      { $set: { 'parents.$': newId } },
      { multi: true }
    ).exec();

    Relevance.update(
      { category: oldId },
      { $set: { category: newId } },
      { multi: true }
    ).exec();

    Relevance.update(
      { tag: oldId },
      { $set: { tag: newId } },
      { multi: true }
    ).exec();

  } catch (err) { return handleError(res)(err); }
  return res.status(200).json(tag);
};

exports.create = (req, res) => {
  let newTag = new Tag(req.body);
  newTag.save((err, tag) => {
    if (err) return handleError(res)(err);
    return res.status(200).json(tag);
  });
};

exports.index = (req, res) => {
  let sort = req.query.sort;
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
  let active = req.query.active;
  let query = { category: true };
  if (active !== undefined) query = { category: true, active: true };

  Tag.find(query)
  .sort('_id')
  .then(categories => res.status(200).json(categories))
  .catch(err => handleError(res)(err));
};

exports.search = (req, res) => {
  let term = req.params.term;
  Tag.find({
    _id: {
      $regex: term,
      $options: 'i'
    }
  })
  .then(foundTags => res.json(200, foundTags))
  .catch(err => handleError(res)(err));
};

