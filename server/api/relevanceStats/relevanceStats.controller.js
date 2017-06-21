import RelevanceStats from './relevanceStats.model';
import Invest from '../invest/invest.model';

async function populateStats() {
  try {
    await RelevanceStats.find({}).remove();
    let investments = await Invest.find({});
    investments.forEach(async invest => {
      try {
        let date = new Date(invest.createdAt);
        date = date.setUTCHours(0, 0, 0, 0);
        let newR = await RelevanceStats.findOneAndUpdate(
          { user: invest.investor, date },
          { $inc: {
            change: invest.relevance || 0,
            upvotes: invest.amount > 0 ? 1 : 0,
            downvotes: invest.amount < 0 ? 1 : 0
          }},
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(invest.relevance, ' ', newR.relevance);
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

// populateStats();
// console.log('now', new Date());


function handleError(res, err) {
  console.log(err);
  return res.status(500).send(err);
}

exports.index = (req, res) => {
  RelevanceStats.find()
  .exec((err, stats) => {
    res.status(200).json(stats);
  });
};

exports.user = async (req, res) => {
  let stats;
  try {
    let user = req.user._id;
    let start = new Date(req.query.start);
    let end = new Date(req.query.end);
    stats = await RelevanceStats.find({ user, date: { $gte: start, $lt: end } });
  } catch (err) {
    handleError(res, err);
  }
  // console.log(stats)
  res.status(200).json(stats);
};
