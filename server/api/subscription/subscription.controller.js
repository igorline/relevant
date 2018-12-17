import Subscription from './subscription.model';

exports.index = async (req, res, next) => {
  let subscriptions;
  try {
    const user = req.user._id;
    subscriptions = await Subscription.find({ follower: user, amount: { $ne: 0 } });
  } catch (err) {
    next(err);
  }
  return res.status(200).json(subscriptions);
};

exports.search = (req, res, next) => {
  const { query } = req;
  Subscription.find(query)
  .then(subscriptions => {
    res.status(200).json(subscriptions);
  })
  .catch(next);
};
