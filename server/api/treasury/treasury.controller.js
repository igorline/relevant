import Treasury from './treasury.model';

exports.index = (req, res, next) => {
  Treasury.find().exec((err, treasury) => {
    if (err) return next(err);
    return res.status(200).json(treasury);
  });
};
