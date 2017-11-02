import voucherCodes from 'voucher-code-generator';
import Invite from './invite.model';
import mail from '../../mail';

// Invite.collection.dropIndexes(function (err, results) {
//   console.log(err);
// });

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return (err) => {
    console.log(err);
    res.status(statusCode).json({ message: err.message });
  };
}

exports.index = async (req, res) => {
  let invites;

  let limit = parseInt(req.query.limit, 50) || null;
  let skip = parseInt(req.query.skip, 0) || null;
  try {
    let query;
    if (req.user.role !== 'admin') {
      query = { invitedBy: req.user._id };
    }
    invites = await Invite.find(query)
    .populate('registeredAs')
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);
  } catch (err) {
    return handleError(res)(err);
  }
  return res.status(200).json(invites);
};

// Takes array of invites;
exports.createInvites = async (invites) => {
  invites = invites.map(async invite => {
    let code = voucherCodes.generate({
      length: 5,
      count: 1,
      charset: 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ'
    })[0];

    let existingInvite;
    if (invite.email) {
      let email = invite.email.trim();
      existingInvite = await Invite.findOne({ email });
      invite = existingInvite || invite;
    }

    if (!existingInvite) {
      // limit invites to 10
      if (invites.length >= 10) {
        throw Error('You can\'t send more than 10 invites at the moment');
      }

      invite = new Invite({ ...invite, code });
    } else {
      invite.invitedBy = invite.invitedBy;
      invite.invitedByString = invite.invitedByString;
    }
    invite = await invite.save();
    if (invite.email) {
      invite = await exports.sendEmailFunc(invite);
    }
    return invite;
  });
  return Promise.all(invites);
};

exports.create = async (req, res) => {
  let invite;
  try {
    let user = req.user;
    if (!user.confirmed) {
      throw new Error('please confirm your email before sending invites');
    }
    let invites = [];
    invite = req.body;
    if (user.role !== 'admin') {
      invites = await Invite.find({ invitedBy: user._id });
      if (!invite.email) throw new Error('please provide invite email');
      if (invite.number > 1) invite.number = 1;
    }
    invite.invitedBy = user._id;
    invites = await exports.createInvites([invite]);
    invite = invites[0];
  } catch (err) {
    return handleError(res)(err);
  }
  return res.status(200).json(invite);
};

exports.sendEmail = async (req, res) => {
  let invite;
  try {
    let _id = req.body.inviteId;
    invite = await exports.sendEmailFunc(_id);
  } catch (err) {
    return handleError(res)(err);
  }
  return res.status(200).json(invite);
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

    let webUrl = 'https://relevant.community';
    if (!invite || !invite.code) throw new Error('no invite or code');
    let url = `${process.env.API_SERVER}/invite/${invite.code}`;
    let androidStoreUrl = 'https://play.google.com/store/apps/details?id=com.relevantnative';
    let name = invite.name;
    let hi = 'Hi!<br /><br />';
    if (name) hi = `<span style="text-transform: capitalize;">Hi ${name}!</span><br /><br />`;
    let intro = 'You are invited to join Relevant';
    if (invite.invitedByString && invite.invitedByString !== '') {
      intro = `${invite.invitedByString} invited you to join Relevant`;
    }
    let data = {
      from: 'Relevant <noreply@mail.relevant.community>',
      to: invite.email,
      subject: 'Your Relevant Invitation',
      html: `
      ${hi}${intro}
      <br />
      <br />
      Your invitation code: <b>${invite.code}</b>
      <br />
      <br />
      <b>Step 1</b>: Download Relevant from the app store:
      <ul>
        <li style="padding-bottom: 10px"><a href="${appStoreUrl}" target="_blank">iOS app store</a>
        <li><a href="${androidStoreUrl}" target="_blank">Android Google Play Store</a>
      </ul>
      <b>Step 2</b>: Launch the app and enter your invite code: <b>${invite.code}</b>
      <br />
      <br />
      -------------------------
      <br />
      <br />
      <span style="font-style: normal">
      Relevant is a social news reader that values quality over clicks. 
      <br/>
      <br/>
      Instead of relying on quantity (# of likes, followers), Relevant implements a quality metric designed to extract valuable content from the noise of the attention economy. Beneficial contributions to the platform are rewarded with Relevant Tokens.
      <br/>
      <br/>
      The app serves as a lab for formulating and experimenting with the Relevance Metric and Relevant Token with the goal of building a self-sustaining economic ecosystem that provides financial incentives to share and curate quality content.
      </span>
      <br />
      <br />
      -------------------------
      <br />
      <br />
      <b>Don't be afraid to share and upvote interesting and informative articles - this is what makes Relevant work.</b>
      <br />
      <br />
      If you have questions, encounter any problems, or wish to send feedback please get in touch via this email: contact@4real.io
      <br />
      <div style="margin-top: 30px"><a href="${webUrl}"><img width="100%" src="https://relevant.community/img/fbimg.jpg" /></a></div>
      `
    };
    // <b>Step 2</b>: <a href="${url}" target="_blank">Open this link</a> from your phone to redeem invitation (or manually enter the code when prompted)

    status = await mail.send(data);
    console.log(status);
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
    return handleError(res)(err);
  }
  if (invite.email) invite.email = invite.email.trim();
  return res.status(200).json(invite);
};

exports.destroy = async (req, res) => {
  let inviteId = req.params.id;
  try {
    await Invite.findById(inviteId).remove();
  } catch (err) {
    return handleError(res)(err);
  }
  return res.sendStatus(200);
};

