const Relevance = require('./relevance.model');

exports.index = (req, res, next) => {
  Relevance.find().exec((err, relevance) => {
    if (err) return next(err);
    return res.status(200).json(relevance);
  });
};

exports.stats = async (req, res, next) => {
  const community = req.query.community || 'relevant';
  const { user } = req;
  let stats;
  try {
    stats = await Relevance.find({
      user: user._id,
      community,
      tag: { $in: user.topTopics }
    }).sort('-relevance');
  } catch (err) {
    next(err);
  }
  res.status(200).json({ stats, nextUpdate: global.nextUpdate });
};
