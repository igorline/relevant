import Earnings from './earnings.model';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return (err) => {
    res.status(statusCode).send(err);
  };
}

exports.get = (req, res) => {
  let query = req.query;
  Earnings.findOne(query)
  .sort({ createdAt: -1 })
  .populate('post user')
  .then(results => res.send(200).json(results))
  .catch(handleError(res));
};

