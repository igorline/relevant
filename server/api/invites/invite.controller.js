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
    let appStoreUrl = 'https://itunes.apple.com/us/app/relevant-a-social-news-reader/id1173025051';

    if (invite && !invite._id) {
      invite = await Invite.findById(invite);
    }

    if (!invite || !invite.code) throw new Error('no invite or code');
    let url = `${process.env.API_SERVER}/invite/${invite.code}`;
    let name = invite.name;
    let hi = '';
    if (name) hi = `Hi ${name}<br /><br />`;
    let data = {
      from: 'Relevant <noreply@mail.relevant.community>',
      to: invite.email,
      subject: 'Invitation to join Relevant',
      html: `
      <div style="text-align: middle"><img width="280px" src="https://relevant.community/img/logo.svg" /></div>
      ${hi}You are invited to join Relevant!
      <br />
      <br />
      Relevant is a social news reader that promotes reliable information and rewards expertise.
      Instead of relying on quantity (# of likes, followers), Relevant’s algorithm relies on a quality metric - relevance score.
      This system is designed to penalise clickbait and fake news while promoting useful and reliable information.
      <br />
      <br />
      invitation code: <b>${invite.code}</b>
      <br />
      <br />
      <b>Step 1</b>: <a href="${appStoreUrl}" target="_blank">Download</a> Relevant from the app store (iOS only for now)
      <br />
      <br />
      <b>Step 2</b>: <a href="${url}" target="_blank">Open this link</a> from your phone to redeem invitation code
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

