import List from './list.model';
import * as InviteController from '../invites/invite.controller';
// List.collection.dropIndexes(function (err, results) {
//   console.log(err);
// });

// List.find({}).sort('-updatedAt').limit(20).then(i => console.log(i));


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
    email = email.trim();
    await List.findOneAndUpdate({ email }, req.body, { upsert: true }).exec();
  } catch (err) {
    handleError(res)(err);
  }
  res.sendStatus(200);
};

exports.invite = async (req, res) => {
  let invites = req.body;
  invites = await InviteController.createInvites(invites);
  await List.update(
    { _id: { $in: invites.map(i => i._id) } },
    { status: 'invited' },
    { multi: true }
  ).exec();
  return invites;
};

exports.delete = async (req, res) => {
  try {
    let id = req.params.id;
    await List.findOne({ _id: id }).remove();
    res.sendStatus(200);
  } catch (err) {
    handleError(res)(err);
  }
};

