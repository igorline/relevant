import { handleAdminInvite } from 'server/api/invites/invite.controller';
import { addUserToEmailList } from 'server/utils/mail';

const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const { promisify } = require('util');
const config = require('../../config/config');
const User = require('../../api/user/user.model');
const Invite = require('../../api/invites/invite.model');
const auth = require('../auth.service');

// Handles both login and signup via http POST request - native
exports.nativeAuth = async (req, res, next) => {
  try {
    const { profile: twitterAuth, invitecode } = req.body;
    if (!twitterAuth || !twitterAuth.userID) throw new Error('Missing twitter id');

    const profile = await getProfile(twitterAuth);
    const user = await handleTwitterAuth({ req, twitterAuth, profile, invitecode });

    const token = auth.signToken(user._id, user.role);
    return res.json({ token, user });
  } catch (err) {
    return next(err);
  }
};

// Handles both login and signup via http GET request - web
exports.setup = () => {
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_ID,
        consumerSecret: process.env.TWITTER_SECRET,
        callbackURL: config.twitter.callbackURL,
        passReqToCallback: true,
        includeEmail: true
      },
      async (req, token, tokenSecret, profile, done) => {
        try {
          const twitterAuth = {
            authToken: token,
            authTokenSecret: tokenSecret
          };
          const { invitecode } = req.query;
          const user = await handleTwitterAuth({ req, twitterAuth, profile, invitecode });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};

export async function handleTwitterAuth({ req, twitterAuth, profile, invitecode }) {
  if (!profile) throw new Error('missing twitter profile');

  let { user } = req;

  const connectedToUser = await isConnectedToDifferentUser({ user, profile });

  if (connectedToUser) {
    throw new Error('A user with this twitter account already exists');
  }

  if (!user) user = await User.findOne({ twitterId: profile.id });

  // check if we have someone with a matching email
  // SECURITY RISK (could potentially add email account to another person's email?)
  if (!user && profile._json.email && profile._json.email.length) {
    user = await User.findOne({
      email: profile._json.email,
      confirmed: true
    });
  }

  const isNewUser = !user || false;

  const handle = profile.username;
  if (isNewUser) {
    user = await addNewTwitterUser({ handle, invitecode });
    user = await addTwitterProfile({ profile, user, twitterAuth });
    await addUserToEmailList(user);
    user = await user.initialCoins();
    if (invitecode && invitecode !== 'undefined') {
      user = await Invite.processInvite({ invitecode, user });
      // const invite = await Invite.findOne({ code: invitecode, redeemed: { $ne: true } });
      // if (invite) user = await invite.referral(user);
    }
  } else if (!user.twitterId) {
    user = await addTwitterProfile({ profile, user, twitterAuth });
    user = await user.addReward({ type: 'twitter' });
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

export async function getProfile(props) {
  const { authToken, authTokenSecret } = props;
  const user_id = props.userID; // eslint-disable-line
  const url = 'https://api.twitter.com/1.1/users/show.json';
  const twitter = new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_ID,
      consumerSecret: process.env.TWITTER_SECRET,
      callbackURL: config.twitter.callbackURL,
      passReqToCallback: true,
      includeEmail: true
    },
    () => null
  );

  // need to bind original object
  const userProfile = promisify(twitter.userProfile.bind(twitter));

  const profile = await userProfile(authToken, authTokenSecret, { url, user_id });
  return profile;
}

export async function addTwitterProfile({ profile, twitterAuth, user }) {
  let { description } = profile._json;
  if (profile._json.entities.description && profile._json.entities.description.urls) {
    profile._json.entities.description.urls.forEach(u => {
      description = description.replace(u.url, u.display_url);
    });
  }
  const image = profile._json.profile_image_url_https;
  const twitterHandle = profile.username;
  const twitterEmail = profile._json.email;
  const twitterImage = image.replace('_normal', '');

  const twitterId = profile.id;

  // TODO include twitter bio URL?
  description += `\ntwitter.com/${profile.username}`;

  if (!user.bio || !user.bio.length) user.bio = description;

  if (!user.image || !user.image.length) {
    user.image = twitterImage;
    // update existing posts using this
    await user.updateMeta();
  }

  if (!user.name) user.name = profile.displayName;

  if (!user.email && twitterEmail && twitterEmail.length) {
    user.email = twitterEmail;
    user.confirmed;
  }

  user.twitter = profile._json;
  user.twitterHandle = twitterHandle;
  user.twitterImage = twitterImage;
  user.twitterEmail = twitterEmail;
  user.twitterId = twitterId;

  user.twitterAuthToken = twitterAuth.authToken;
  user.twitterAuthSecret = twitterAuth.authTokenSecret;

  return user.save();
}

async function isConnectedToDifferentUser({ user, profile }) {
  if (!user) return null;
  return User.findOne({ twitterId: profile.id, _id: { $ne: user._id.toString() } });
}

export async function addNewTwitterUser({ handle }) {
  const handleExists = await User.findOne({ handle });
  if (handleExists) {
    handle += Math.random()
      .toString(36)
      .substr(2, 3);
  }

  const user = new User({
    role: 'temp',
    handle,
    provider: 'twitter'
  });
  return user.save();
}
