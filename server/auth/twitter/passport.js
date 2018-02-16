const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const config = require('../../config/config');
const { promisify } = require('util');
const User = require('../../api/user/user.model');
const auth = require('../auth.service');
const Invite = require('../../api/invites/invite.model');
const TwitterWorker = require('../../utils/twitterWorker');
const TwitterFeed = require('../../api/twitterFeed/twitterFeed.model');

// User.findOne({ twitterHandle: '4REALGLOBAL' })
// .then(user => {
//   if (!user) return;
//   user.twitter = {};
//   user.twitterHandle = null;
//   user.twitterId = null;
//   user.lastTweetId = null;
//   user.twitterImage = null;
//   user.twitter.twitterAuthToken = null;
//   user.twitter.twitterAuthSecret = null;
//   user.save();
//   TwitterFeed.find({ user: user._id }).remove().exec();
//   // user.remove();
// })
// .catch(err => console.log(err));

// User.findOne({ twitterHandle: '4REALGLOBAL' }).remove().exec();

// User.find({ email: { $exists: false }}).then(users => {
//   users.forEach(u => {
//     console.log(u._id);
//     console.log(u);
//     // u.email = u.twitter.email;
//     // u.twitterEmail = u.email;
//     // u.save();
//   });
// });

export async function getProfile(props) {
  let authToken = props.authToken;
  let authTokenSecret = props.authTokenSecret;
  let user_id = props.userID;
  let url = 'https://api.twitter.com/1.1/users/show.json';
  let twitter = new TwitterStrategy({
    consumerKey: process.env.TWITTER_ID,
    consumerSecret: process.env.TWITTER_SECRET,
    callbackURL: config.twitter.callbackURL,
    passReqToCallback: true,
    includeEmail: true,
  }, () => null);

  // need to bind original object
  let userProfile = promisify(twitter.userProfile.bind(twitter));

  let profile = await userProfile(
    authToken,
    authTokenSecret,
    { url, user_id },
  );
  return profile;
}

export async function addTwitterProfile(param) {
  let { user, profile, twitterAuth } = param;
  let description = profile._json.description;
  if (profile._json.entities.description && profile._json.entities.description.urls) {
    profile._json.entities.description.urls.forEach(u => {
      description = description.replace(u.url, u.display_url);
      // console.log(description);
    });
  }
  let image = profile._json.profile_image_url_https;
  let twitterHandle = profile.username;
  let twitterEmail = profile._json.email;
  console.log(twitterEmail);
  let twitterImage = image.replace('_normal', '');
  let twitterId = profile.id;

  // TODO include twitter bio URL?
  // console.log(profile._json.entities.url.urls);
  description += `\ntwitter.com/${profile.username}`;
  let newImage;

  if (!user.bio || !user.bio.length) {
    user.bio = description;
  }
  if (!user.image || !user.image.length) {
    user.image = twitterImage;
    // update existing posts using this
    await user.updateMeta();
  }
  if (!user.name) {
    user.name = profile.displayName;
  }
  if (!user.email) user.email = twitterEmail;
  user.twitter = profile._json;
  user.twitterHandle = twitterHandle;
  user.twitterImage = twitterImage;
  user.twitterEmail = twitterEmail;
  user.twitterId = twitterId;

  user.twitterAuthToken = twitterAuth.authToken;
  user.twitterAuthSecret = twitterAuth.authTokenSecret;

  // console.log(user);
  user = await user.save();
  TwitterWorker.updateTwitterPosts(user._id);

  return user;
}

exports.login = async (req, res, next) => {
  try {
    let profile = req.body.profile;
    if (!profile.userID) throw new Error('missing twitter id');
    let relUser = req.user;

    let user = await User.findOne(
      { twitterId: parseInt(profile.userID, 10) },
      ['+twitterAuthToken', '+twitterAuthSecret']
    );

    if (user && relUser && relUser._id !== user._id) {
      throw new Error('user with this twitter handle already exists');
    }

    if (relUser) user = relUser;

    if (user) {
      // console.log('found user! ', user);
      // check that we have auth
      profile = await getProfile(profile);
      if (!profile) throw new Error('missing twitter profile');

      // connect twitter for logged in user;
      if (relUser) {
        user = await addTwitterProfile({ user, profile, twitterAuth: req.body.profile });
        // async fetch posts
      }

      if (user.twitterAuthToken !== req.body.profile.authToken
        ||
        user.twitterAuthSecret !== req.body.profile.authTokenSecret) {
        console.log('tw auth not equal!, need to update');
        user.twitterAuthToken = req.body.authToken;
        user.twitterAuthSecret = req.body.authSecret;
        await user.save();
      }
      let token = auth.signToken(user._id, user.role);
      return res.json({ token, user });
    } else if (req.body.profile.signup) {
      profile = await getProfile(req.body.profile);
      // check invite
      if (!req.body.invite) throw new Error('No user found, please make sure you sign up first');
      let invite = await Invite.checkInvite(req.body.invite);

      if (req.body.profile.userName === 'everyone') {
        return res.json(200, { needHandle: true });
      }

      user = new User({
        _id: req.body.profile.userName,
        handle: req.body.profile.userName,
        confirmed: true,
        provider: 'twitter',
        role: 'user',
      });

      user = await addTwitterProfile({ user, profile, twitterAuth: req.body.profile });
      user = await user.initialCoins();

      // async fetch tweets
      await TwitterWorker.updateTwitterPosts(user._id);

      await invite.registered(user);

      await user.save();
      let token = auth.signToken(user._id, user.role);
      return res.json({ token, user });
    } else {
      return res.json(200, { twitter: true });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.setup = () => {
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_ID,
    consumerSecret: process.env.TWITTER_SECRET,
    callbackURL: config.twitter.callbackURL,
    passReqToCallback: true,
    includeEmail: true,
  },
  async (req, token, tokenSecret, profile, done) => {
    try {
      let user = await User.findOne({
        'twitter.id': profile.id
      });

      if (!user) {
        let description = profile._json.description;
        if (profile._json.entities.description && profile._json.entities.description.urls) {
          profile._json.entities.description.urls.forEach(u => {
            description = description.replace(u.url, u.display_url);
            console.log(description);
          });
        }

        // TODO include twitter bio URL?
        // console.log(profile._json.entities.url.urls);
        description += `\ntwitter.com/${profile.displayName}`;

        user = {
          name: profile.displayName,
          username: profile.username,
          role: 'user',
          provider: 'twitter',
          twitter: profile._json,
          email: profile.email,
          image: profile._json.profile_image_url_https,
          bio: description,
          type: 'temp'
        };
        // console.log(user);
        // user = new User({
        //   name: profile.displayName,
        //   _id: profile.username + _tmpUser,
        //   role: 'user',
        //   provider: 'twitter',
        //   twitter: profile._json
        // });
        // user.save(function(err) {
        //   if (err) return done(err);
        //   return done(err, user);
        // });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
};
