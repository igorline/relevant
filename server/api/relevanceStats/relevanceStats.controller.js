import RelevanceStats from './relevanceStats.model';
import Invest from '../invest/invest.model';

// eslint-disable-next-line
async function populateStats() {
  try {
    await RelevanceStats.find({}).remove();
    const investments = await Invest.find({});
    investments.forEach(async invest => {
      try {
        let date = new Date(invest.createdAt);
        date = date.setUTCHours(0, 0, 0, 0);
        await RelevanceStats.findOneAndUpdate(
          { user: invest.investor, date },
          {
            $inc: {
              change: invest.relevance || 0,
              upvotes: invest.amount > 0 ? 1 : 0,
              downvotes: invest.amount < 0 ? 1 : 0
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (err) {
        throw err;
      }
    });
  } catch (err) {
    throw err;
  }
}

// populateStats();

exports.index = (req, res) => {
  RelevanceStats.find().exec((err, stats) => {
    res.status(200).json(stats);
  });
};

exports.user = async (req, res, next) => {
  try {
    const user = req.user._id;
    const start = new Date(req.query.start);
    const end = new Date(req.query.end);
    const stats = await RelevanceStats.find({ user, date: { $gte: start, $lt: end } });
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};
