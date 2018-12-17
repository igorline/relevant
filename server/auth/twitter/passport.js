const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const config = require('../../config/config');
const { promisify } = require('util');
const User = require('../../api/user/user.model');
const auth = require('../auth.service');
const TwitterWorker = require('../../utils/twitterWorker');

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

export async function addTwitterProfile(param) {
  const { profile, twitterAuth } = param;
  let { user } = param;
  let { description } = profile._json;
  if (profile._json.entities.description && profile._json.entities.description.urls) {
    profile._json.entities.description.urls.forEach(u => {
      description = description.replace(u.url, u.display_url);
      // console.log(description);
    });
  }
  const image = profile._json.profile_image_url_https;
  const twitterHandle = profile.username;
  const twitterEmail = profile._json.email;
  const twitterImage = image.replace('_normal', '');

  const twitterId = profile.id;

  // TODO include twitter bio URL?
  // console.log(profile._json.entities.url.urls);
  description += `\ntwitter.com/${profile.username}`;

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
  return user;
}

exports.login = async (req, res, next) => {
  try {
    let { profile } = req.body;
    if (!profile || !profile.userID) throw new Error('missing twitter id');
    const relUser = req.user;

    let user = await User.findOne({ twitterId: parseInt(profile.userID, 10) }, [
      '+twitterAuthToken',
      '+twitterAuthSecret',
      '+twitter'
    ]);

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
        TwitterWorker.updateTwitterPosts(user._id);
        // async fetch posts
      }

      if (
        user.twitterAuthToken !== req.body.profile.authToken ||
        user.twitterAuthSecret !== req.body.profile.authTokenSecret
      ) {
        user.twitterAuthToken = req.body.authToken;
        user.twitterAuthSecret = req.body.authSecret;
        await user.save();
      }
      const token = auth.signToken(user._id, user.role);
      return res.json({ token, user });
    } else if (req.body.profile.signup) {
      profile = await getProfile(req.body.profile);

      if (req.body.profile.userName === 'everyone') {
        return res.json(200, { needHandle: true });
      }

      user = new User({
        _id: req.body.profile.userName,
        handle: req.body.profile.userName,
        confirmed: true,
        provider: 'twitter',
        role: 'user'
      });

      user = await addTwitterProfile({ user, profile, twitterAuth: req.body.profile });
      user = await user.initialCoins();
      TwitterWorker.updateTwitterPosts(user._id);

      // async fetch tweets
      await TwitterWorker.updateTwitterPosts(user._id);
      // await invite.registered(user);

      await user.save();
      const token = auth.signToken(user._id, user.role);
      return res.json({ token, user });
    }

    return res.json(200, { twitter: true });
  } catch (err) {
    return next(err);
  }
};

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
          let user = await User.findOne({
            $or: [
              { twitterId: profile.id },
              { email: profile._json.email, confirmed: true }
            ]
          });

          if (req.user) user = req.user;

          let handle = profile.username;
          const handleExists = await User.findOne({ handle });
          if (handleExists) {
            handle = Math.random()
            .toString(36)
            .substr(2, 5);
          }

          if (!user) {
            user = new User({
              role: 'temp',
              _id: profile._json.id,
              handle,
              confirmed: true,
              provider: 'twitter'
            });
          }

          const params = {
            profile,
            user,
            twitterAuth: {
              authToken: token,
              authTokenSecret: tokenSecret
            }
          };
          if (!user.twitterId) {
            user = await addTwitterProfile(params);
          }
          // TODO need to make sure we don't store these as number in db
          // number causes a js overflow and makes it different
          // user.twitterId
          // profile.id

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
