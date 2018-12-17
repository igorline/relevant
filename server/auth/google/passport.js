const passport = require('passport');
// eslint-disable-next-line
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

exports.setup = (User, config) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL
      },
      (accessToken, refreshToken, profile, done) => {
        User.findOne(
          {
            'google.id': profile.id
          },
          (err, user) => {
            if (!user) {
              user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                role: 'user',
                username: profile.username,
                provider: 'google',
                google: profile._json
              });
              return user.save(err1 => {
                if (err1) return done(err1);
                return done(err1, user);
              });
            }
            return done(err, user);
          }
        );
      }
    )
  );
};
