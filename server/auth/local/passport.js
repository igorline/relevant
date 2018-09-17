const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

exports.setup = function setup(User) {
  passport.use(new LocalStrategy({
    usernameField: 'name',
    passwordField: 'password' // this is the virtual field on the model
  },
  (name, password, done) => {
    let email = /^.+@.+\..+$/.test(name);
    let formatted = '^' + name + '$';
    let quareyParam = { $regex: formatted, $options: 'i' };
    let query = email ? { email: quareyParam } : { handle: quareyParam };
    User.findOne(query)
    .select('+hashedPassword +salt').exec((err, user) => {
      if (err) return done(err);
      if (!user) {
        console.log(name, 'name here');
        return done(null, false, { message: 'This username or email is not registered.' });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'This password is not correct.' });
      }
      return done(null, user);
    });
  }
  ));
};
