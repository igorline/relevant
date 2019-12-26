import uuid from 'uuid/v4';
import CommunityMember from 'server/api/community/community.member.model';
import { totalAllowedInvites } from 'server/config/globalConstants';
import Community from 'server/api/community/community.model';
import { sendEmail } from 'server/utils/mail';
import Invite from './invite.model';

const inlineCss = require('inline-css');
const { emailStyle } = require('../../utils/emailStyle');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return err => {
    res.status(statusCode).json({ message: err.message });
  };
}

exports.index = async (req, res, next) => {
  const { community } = req.query;
  let invites;

  const limit = parseInt(req.query.limit, 0) || null;
  const skip = parseInt(req.query.skip, 0) || null;

  try {
    const query = { invitedBy: req.user._id, community };
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
    const code = uuid();
    invite = new Invite({ ...invite, code });
    invite = await invite.save();
    if (invite.email) {
      invite = await exports.sendEmailFunc(invite);
    }
    return invite;
  });
  return Promise.all(invites);
};

exports.create = async (req, res, next) => {
  try {
    const { user, communityMember } = req;
    const { communityId, community } = communityMember;
    const { email, name, invitee } = req.body;
    const type = req.body.type || 'referral';
    let invite = {
      invitedBy: user._id,
      invitedByString: user.name,
      invitee,
      email: email ? email.trim() : null,
      name: name ? name.trim() : null,
      type,
      number: 1,
      community,
      communityId
    };

    if (!user.relevance) {
      user.relevance = await CommunityMember.findOne({
        user: user._id,
        communityId
      });
    }
    if (!user.relevance) {
      throw new Error("You don't have enough reputation to refer new users");
    }

    const unusedInvites = await computeInviteNumber({ user, communityId });
    if (unusedInvites <= 0) {
      throw new Error(
        'You have used all of your available referrals - earn more reputation to get more!'
      );
    }

    // TODO consensus of existing admins
    if (invite.type === 'admin' && user.role !== 'admin' && !communityMember.superAdmin) {
      throw new Error("You don't have the privileges required to invite an admin");
    }

    invite = await exports.createInvites([invite]);
    if (invite.type !== 'admin') communityMember.invites = unusedInvites - 1;
    await communityMember.save();

    return res
      .status(200)
      .json({ invite, count: { [community]: communityMember.invites } });
  } catch (err) {
    return next(err);
  }
};

async function computeInviteNumber({ user, communityId }) {
  if (!user.relevance) {
    user.relevance = await CommunityMember.findOne({
      user: user._id.toString(),
      communityId
    });
    if (!user.relevance) return 0;
  }
  const totalInvites = totalAllowedInvites(user.relevance.pagerank);
  const usedInvites = await Invite.countDocuments({
    invitedBy: user._id,
    communityId,
    type: 'referral'
  });
  return totalInvites - usedInvites;
}

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
  let invite = _invite;

  if (invite && !invite._id) {
    invite = await Invite.findById(invite);
  }

  if (!invite || !invite.code) throw new Error('no invite or code');
  let name = invite.name ? invite.name.split(' ')[0] : null;
  if (name) name = name.charAt(0).toUpperCase() + name.slice(1);
  let hi = 'Hi!<br /><br />';
  if (name) {
    hi = `<span style="text-transform: capitalize;">Hi ${name}!</span><br /><br />`;
  }
  let intro =
    'You are invited to join Relevant, a social news reader that values <i>quality</i> over <i>clicks</i>.';
  if (invite.invitedByString && invite.invitedByString !== '') {
    intro = `${invite.invitedByString} invited you to join Relevant, a social news reader that values <i>quality</i> over <i>clicks</i>.`;
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
    from: 'Relevant <info@relevant.community>',
    to: invite.email,
    subject: 'Your Relevant Invitation',
    html
  };

  await sendEmail(data);
  invite.status = 'email sent';
  invite = await invite.save();
  return invite;
};

exports.adminInvite = async (req, res, next) => {
  try {
    let { user } = req;
    const { invitecode } = req.body;
    user = await exports.handleAdminInvite({ user, invitecode });
    return res.status(200).json(user);
  } catch (err) {
    return next(err);
  }
};

exports.handleAdminInvite = async ({ user, invitecode }) => {
  if (!invitecode) throw new Error('No invitation code');
  const invite = await Invite.findOne({
    code: invitecode,
    type: 'admin',
    redeemed: { $ne: true }
  });
  if (!invite) throw new Error('Missing or used invite');

  const { communityId } = invite;

  const communityInstance = await Community.findOne({ _id: communityId });
  const role = invite.type === 'admin' ? 'admin' : null;
  await communityInstance.join(user._id, role);

  invite.redeemed = true;
  await invite.save();

  const relevance = await CommunityMember.findOne({
    user: user._id,
    communityId
  });
  relevance.pagerank = 70;
  await relevance.save();
  user.relevance = relevance;
  return user;
};

exports.count = async (req, res, next) => {
  try {
    const { user, communityMember } = req;
    const { communityId, community } = communityMember;
    const number = await computeInviteNumber({ user, communityId });
    return res.status(200).json({ [community]: number });
  } catch (err) {
    return next(err);
  }
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
