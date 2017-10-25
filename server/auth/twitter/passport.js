const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

exports.setup = function (User, config) {
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
