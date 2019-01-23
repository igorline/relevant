import Earnings from './earnings.model';

exports.index = async (req, res, next) => {
  try {
    const { user } = req;
    const { status } = req.query;
    let query = { user: user._id };
    if (status && status !== 'all') query = { user: user._id, status };
    const earnings = await Earnings.find(query)
    .sort({ createdAt: -1 });
    res.status(200).json(earnings);
  } catch (err) {
    next(err);
  }
};
