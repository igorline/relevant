import Earnings from './earnings.model';

exports.index = async (req, res, next) => {
  try {
    const { user } = req;
    const { status } = req.query;
    const limit = parseInt(req.query.limit, 10);
    const skip = parseInt(req.query.skip, 10);
    let query = { user: user._id };
    if (status && status !== 'all') query = { user: user._id, status };
    const earnings = await Earnings.find(query)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });
    res.status(200).json(earnings);
  } catch (err) {
    next(err);
  }
};
