
import User from '../user/user.model';

const Relevance = require('./relevance.model');


function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}

exports.index = (req, res) => {
  Relevance.find()
  // .populate('user, tag')
    .exec((err, relevance) => {
      if (err) return handleError(res, err);
      return res.status(200).json(relevance);
    });
};

exports.stats = async (req, res) => {
  const community = req.query.community || 'relevant';
  const user = req.user;
  let stats;
  try {
    stats = await Relevance.find({ user: user._id, community, tag: { $in: user.topTopics } })
      .sort('-relevance');
  } catch (err) {
    handleError(err);
  }
  res.status(200).json({ stats, nextUpdate: global.nextUpdate });
};

