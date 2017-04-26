import Subscription from './subscription.model';

function handleError(res, err) {
  console.log(err);
  return res.send(500, err);
}

exports.index = async (req, res) => {
  let subscriptions;
  try {
    let user = req.user._id;
    subscriptions = await Subscription.find({ follower: user, amount: { $ne: 0 } });
  } catch (err) {
    handleError(res, err);
  }
  return res.status(200).json(subscriptions);
};

exports.search = (req, res) => {
  let query = req.query;
  console.log(query, 'query');

  Subscription.find(query).then((subscriptions) => {
    res.status(200).json(subscriptions);
  });
};

