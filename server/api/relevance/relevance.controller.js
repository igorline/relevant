
let Relevance = require('./relevance.model');

// Relevance.find({ _id: '58545d5478ee31e893ffecb8' }).remove().exec();
// .then(tag => console.log('empty tag', tag));

exports.index = (req, res) => {
  Relevance.find()
  // .populate('user, tag')
  .exec((err, relevance) => {
    if (err) return handleError(res, err);
    return res.status(200).json(relevance);
  });
};


function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
};