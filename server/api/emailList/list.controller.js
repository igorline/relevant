import List from './list.model';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return (err) => {
    console.log(err);
    res.status(statusCode).json({ message: err.message });
  };
}

// List.find({}).remove().exec();

exports.index = async (req, res) => {
  let list;
  try {
    list = await List.find({ status: { $ne: 'invited' } });
  } catch (err) {
    handleError(res)(err);
  }
  res.status(200).json(list);
};

exports.addWaitlist = async (req, res) => {
  try {
    let email = req.body.email;
    if (!email) throw new Error('no email');
    await List.findOneAndUpdate({ email }, req.body, { upsert: true }).exec();
  } catch (err) {
    handleError(res)(err);
  }
  res.send(200);
};

