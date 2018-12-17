const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

exports.setup = (User, config) => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL
      },
      (accessToken, refreshToken, profile, done) => {
        User.findOne(
          {
            'facebook.id': profile.id
          },
          (err, user) => {
            if (err) return done(err);
            if (!user) {
              user = new User({
                name: profile.displayName,
                // email: profile.emails[0].value,
                role: 'user',
                username: profile.username,
                provider: 'facebook',
                facebook: profile._json
              });
              return user.save(_err => {
                if (_err) return done(_err);
                return done(_err, user);
              });
            }
            return done(err, user);
          }
        );
      }
    )
  );
};
