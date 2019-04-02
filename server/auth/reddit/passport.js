import queryString from 'query-string';
import { handleAdminInvite } from 'server/api/invites/invite.controller';

const passport = require('passport');
const RedditStrategy = require('passport-reddit').Strategy;
const config = require('../../config/config');
const User = require('../../api/user/user.model');
const Invite = require('../../api/invites/invite.model');

// User.find({ 'reddit.id': { $exists: true } })
// .remove()
// .exec();

// User.findOne({ 'reddit.id': { $exists: true } }, '+reddit')
// .then(async user => {
//   user.redditId = null;
//   user.reddit = null;
//   await user.save();
// });

passport.use(
  new RedditStrategy(
    {
      clientID: config.reddit.clientID,
      clientSecret: config.reddit.clientSecret,
      callbackURL: config.reddit.callbackURL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const redditAuth = { accessToken, refreshToken };
        req.query = queryString.parse(req.query.state);
        const { invitecode } = req.query;
        const user = await handleAuth({ req, redditAuth, profile, invitecode });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export async function handleAuth({ req, redditAuth, profile, invitecode }) {
  if (!profile) throw new Error('missing reddit profile');

  let { user } = req;

  const isConnectAccount = user || false;
  const alreadyInUse =
    isConnectAccount && (await isConnectedToDifferentUser({ user, profile }));

  if (alreadyInUse) {
    throw new Error('A user with this reddit account already exists');
  }

  if (!isConnectAccount) user = await User.findOne({ redditId: profile._json.id });

  const isNewUser = !user || false;

  const handle = profile._json.name;
  if (isNewUser) {
    const extraRewards = Math.round(Math.log10(profile._json.comment_karma || 1) * 10);
    user = await addNewRedditUser({ handle });
    user = await addRedditProfile({ profile, user, redditAuth });
    user = await user.addReward({ type: 'reddit', extraRewards });
    if (invitecode && invitecode !== 'undefined') {
      user = await Invite.processInvite({ invitecode, user });
    }
  } else if (!user.redditId) {
    user = await addRedditProfile({ profile, user, redditAuth });
    user = await user.addReward({ type: 'reddit' });
  }

  if (!isNewUser && invitecode && invitecode !== 'undefined') {
    try {
      user = await handleAdminInvite({ invitecode, user });
    } catch (err) {
      console.log(err); // eslint-disable-line
    }
  }

  return user.save();
}

async function isConnectedToDifferentUser({ user, profile }) {
  return User.findOne({ redditId: profile._json.id, _id: { $ne: user._id } });
}

export async function addNewRedditUser({ handle }) {
  const handleExists = await User.findOne({ handle });
  if (handleExists) {
    handle += Math.random()
    .toString(36)
    .substr(2, 3);
  }

  const user = new User({
    role: 'temp',
    handle,
    provider: 'reddit'
  });
  return user.save();
}

export async function addRedditProfile({ profile, redditAuth, user }) {
  const redditUser = profile._json;
  const image = redditUser.icon_img;

  if (!user.image || !user.image.length) {
    user.image = image;
    // update existing posts
    await user.updateMeta();
  }
  if (!user.name) user.name = redditUser.name;

  user.reddit = redditUser;
  user.redditId = redditUser.id;

  user.redditAuth = redditAuth;
  return user.save();
}
