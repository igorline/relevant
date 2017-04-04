import voucherCodes from 'voucher-code-generator';
import Invite from './invite.model';
import mail from '../../mail';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return (err) => {
    console.log(err);
    res.status(statusCode).json({ message: err.message });
  };
}

// List.find({}).remove().exec();

exports.index = async (req, res) => {
  let invites;
  try {
    invites = await Invite.find({}).sort({ createdAt: -1 });
  } catch (err) {
    handleError(res)(err);
  }
  res.status(200).json(invites);
};

exports.create = async (req, res) => {
  let invite;
  try {
    let code = voucherCodes.generate({
      length: 5,
      count: 1,
      charset: voucherCodes.charset('alphabetic')
    })[0];
    invite = new Invite({ ...req.body, code });
    invite = await invite.save();
    exports.sendEmailFunc(invite);
  } catch (err) {
    handleError(res)(err);
  }
  res.status(200).json(invite);
};

exports.sendEmail = async (req, res) => {
  let invite;
  try {
    let _id = req.body.inviteId;
    invite = await exports.sendEmailFunc(_id);
  } catch (err) {
    throw err;
    handleError(res)(err);
  }
  res.status(200).json(invite);
};

exports.sendEmailFunc = async function(_invite) {
  let status;
  let invite = _invite;
  try {
    // let appStoreUrl = 'http://itunes.com/apps/relevant';
    let appStoreUrl = 'https://beta.itunes.apple.com/v1/invite/4a6e102029cb485b9e443ad17a65de3fce01cad9aaa948adaf95840ed2a32c6945eaf11b?ct=slavabalasan299393905&advp=10000&platform=ios';

    if (invite && !invite._id) {
      invite = await Invite.findById(invite);
    }

    if (!invite || !invite.code) throw new Error('no invite or code');
    let url = `${process.env.API_SERVER}/invite/${invite.code}`;
    let data = {
      from: 'Relevant <noreply@mail.relevant.community>',
      to: invite.email,
      subject: 'Invitation to join Relevant',
      html: `You are invited to join Relevant as a beta tester!
      <br />
      <br />
      invitation code: <b>${invite.code}</b>
      <br />
      <br />
      <b>Step 1</b>: Download the app from the app store (iOS only for now):
      <br />
      <a href="${appStoreUrl}" target="_blank">${appStoreUrl}</a>
      <br />
      <br />
      <b>Step 2</b>: Open this link from your phone to redeem invitation code:
      <br />
      <a href="${url}" target="_blank">${url}</a>
      <br />
      <br />
      You can also manually enter your invitation code after you launch the app.`
    };
    status = await mail.send(data);
    invite.status = 'email sent';
    invite = await invite.save();
  } catch (err) {
    throw err;
  }
  return invite;
};

exports.checkInviteCode = async (req, res) => {
  let invite;
  try {
    let code = req.body.code;
    if (!code) throw new Error('No invitation code');
    invite = await Invite.findOne({ code, redeemed: false });
    if (!invite) throw new Error('Invalid invitation code');
    invite.status = 'checked';
    invite.save();
  } catch (err) {
    handleError(res)(err);
  }
  res.status(200).json(invite);
};

exports.destroy = async (req, res) => {
  let inviteId = req.params.id;
  try {
    await Invite.findById(inviteId).remove();
  } catch (err) {
    handleError(res)(err);
  }
  res.sendStatus(200);
};

