import Earnings from './earnings.model';

// Earnings.find({}).remove().exec()

exports.get = async (req, res) => {
  // let query = req.query;
  let earnings = await Earnings.find({})
  .sort({ createdAt: -1 });
  // .populate('post user');
  return earnings;
};

