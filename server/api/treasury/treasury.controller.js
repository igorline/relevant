const Treasury = require('./treasury.model');

exports.index = (req, res) => {
  Treasury.find()
    .exec((err, treasury) => {
      if (err) return handleError(res, err);
      return res.status(200).json(treasury);
    });
};

function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}
