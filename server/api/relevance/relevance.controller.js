
let Relevance = require('./relevance.model');

// Relevance.find({ _id: '58545d5478ee31e893ffecb8' }).remove().exec();
// .then(tag => console.log('empty tag', tag));

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
};

exports.index = (req, res) => {
  Relevance.find()
  // .populate('user, tag')
  .exec((err, relevance) => {
    if (err) return handleError(res, err);
    return res.status(200).json(relevance);
  });
};

exports.stats = async (req, res) => {
  let user = req.user;
  let stats;
  try {
    stats = await Relevance.find({ user: user._id, tag: { $in: user.topTopics } })
    .sort('-relevance');
  } catch (err) {
    handleError(err);
  }
  res.status(200).json(stats);
};

