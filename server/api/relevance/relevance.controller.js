
let Relevance = require('./relevance.model');

import User from '../user/user.model';

async function migrateToCommunityReputation() {
  try {
    let users = await User.find({});
    users.forEach(async u => {
      try {
        let newRep = await Relevance.findOneAndUpdate(
          { community: 'relevant', user: u._id },
          { reputation: u.reputation,
            level: u.level || 0,
            rank: u.rank || 0,
            percentRank: u.percentRank || 0,
            relevanceRecord: u.relevanceRecord,
            global: true,
          },
          { upsert: true, new: true }
        );
        console.log(newRep);
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
};
// migrateToCommunityReputation();

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
  res.status(200).json({ stats, nextUpdate: global.nextUpdate });
};

