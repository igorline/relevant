import voucherCodes from 'voucher-code-generator';
import Invite from './invite.model';
import mail from '../../mail';

const inlineCss = require('inline-css');
const { emailStyle } = require('../../utils/emailStyle');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return err => {
    res.status(statusCode).json({ message: err.message });
  };
}

exports.index = async (req, res, next) => {
  let invites;

  const limit = parseInt(req.query.limit, 0) || null;
  const skip = parseInt(req.query.skip, 0) || null;

  try {
    let query;
    if (req.user.role !== 'admin') {
      query = { invitedBy: req.user._id };
    }
    invites = await Invite.find(query)
    .populate('registeredAs')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);
  } catch (err) {
    return next(err);
  }
  return res.status(200).json(invites);
};

// Takes array of invites;
exports.createInvites = async invites => {
  invites = invites.map(async invite => {
    const code = voucherCodes.generate({
      length: 5,
      count: 1,
      charset: 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ'
    })[0];

    let existingInvite;
    if (invite.email) {
      const email = invite.email.trim();
      existingInvite = await Invite.findOne({ email });
      invite = existingInvite || invite;
    }

    if (!existingInvite) {
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
    const { user } = req;
    if (!user.confirmed) {
      throw new Error('please confirm your email before sending invites');
    }
    let invites = [];
    invite = req.body;
    if (user.role !== 'admin') {
      invites = await Invite.find({ invitedBy: user._id });
      if (!invite.email) throw new Error('please provide invite email');
      if (invite.number > 1) invite.number = 1;

      // limit invites to 10
      // if (invites.length >= 10) {
      //   throw Error('You can\'t send more than 10 invites at the moment');
      // }
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
    const _id = req.body.inviteId;
    invite = await exports.sendEmailFunc(_id);
  } catch (err) {
    return handleError(res)(err);
  }
  return res.status(200).json(invite);
};

exports.sendEmailFunc = async function inviteEamil(_invite) {
  try {
    let invite = _invite;
    // const appStoreUrl =
    //  'https://itunes.apple.com/us/app/relevant-a-social-news-reader/id1173025051';

    if (invite && !invite._id) {
      invite = await Invite.findById(invite);
    }
    // const webUrl = 'https://relevant.community';

    if (!invite || !invite.code) throw new Error('no invite or code');
    // const url = `${process.env.API_SERVER}/invite/${invite.code}`;
    // const androidStoreUrl =
    //  'https://play.google.com/store/apps/details?id=com.relevantnative';
    let name = invite.name ? invite.name.split(' ')[0] : null;
    if (name) name = name.charAt(0).toUpperCase() + name.slice(1);
    let hi = 'Hi!<br /><br />';
    if (name) {
      hi = `<span style="text-transform: capitalize;">Hi ${name}!</span><br /><br />`;
    }
    let intro =
      'You are invited to join Relevant, a social news reader that values <i>quality</i> over <i>clicks</i>.';
    if (invite.invitedByString && invite.invitedByString !== '') {
      intro = `${
        invite.invitedByString
      } invited you to join Relevant, a social news reader that values <i>quality</i> over <i>clicks</i>.`;
    }

    let html = `
      <p>
      ${hi}${intro}
      <p>

      <hr/>

      <p>
      <b>Mobile</b>: Download Relevant from the app store:
      </p>

      <p>
        <a
          href="https://itunes.apple.com/us/app/relevant-a-social-news-reader/id1173025051?mt=8"
          style="display:inline-block;"
        >
         <img
          alt="iOS App Store"
          style="width:auto; max-height: 40px; height: 40px; max-width:none;"
          src="https://relevant.community/img/appstore.png"/>
        </a>

        &nbsp;&nbsp;&nbsp;&nbsp;
        <a
          href="https://play.google.com/store/apps/details?id=com.relevantnative&amp;pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
          style="display:inline-block;"
        >
          <img
            alt="Google Play Store"
            style="width:auto; max-height: 40px; height: 40px; max-width:none;"
            src="https://relevant.community/img/googleplaystore.png">
          </a>
      </p>

      <p>
      <b>Desktop</b>: Navigate to https://relevant.community/home and sing up!
      </p>

      <hr/>
      <p>
      <a href="https://blog.relevant.community/relevant-an-introduction-5b79ef7afa9" target="_blank" style="text-decoration:none;">
      <span>Read Our Mission Statement</span>
      </a>
      </p>
      <p>
        We created Relevant because we saw how exploitative existing platforms have become — they treat people like commodities and culture like a slot machine and we are starting to fear their long-term effects on our world.
      </p>

      <p>
      At Relevant, we have created a <b>quality metric</b> for the attention economy that lets you share and rank information according to it’s value. Unlike other networks that fill your feed with clickbait and promoted posts, Relevant is optimized for and by <b>you</b>. 
      </p>

      <p>
      Join RELEVANT and get the best social news reader today — for a better information environment tomorrow.
      </p>

      <hr/>

      <p>If you want to get involved or just say hello you can find us on <a href="https://join.slack.com/t/relevantcommunity/shared_invite/enQtMjIwMjEwNzUzMjUzLTFkOTkwNzFjN2EzMjFhYTVkZDZmYzU1ZGFlZmY4MzdjNGMyOWIwYjhmYTE2OTQ1NmJlOWVmNjkyODNjM2I4YWI">Slack</a> or <a href="https://twitter.com/relevantfeed">Twitter</a><br></p><p><br></p>
      <p>
      <a href="https://relevant.community">
      <img src="https://relevant.community/img/logo.png">
      </a>
      </p>
      `;

    html = await inlineCss(emailStyle + html, { url: 'https://relevant.community' });

    const data = {
      from: 'Relevant <noreply@mail.relevant.community>',
      to: invite.email,
      subject: 'Your Relevant Invitation',
      html
    };

    await mail.send(data);
    invite.status = 'email sent';
    invite = await invite.save();
    return invite;
  } catch (err) {
    throw err;
  }
};

exports.checkInviteCode = async (req, res) => {
  let invite;
  try {
    const { code } = req.body;
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
  const inviteId = req.params.id;
  try {
    await Invite.findById(inviteId).remove();
  } catch (err) {
    return handleError(res)(err);
  }
  return res.sendStatus(200);
};
