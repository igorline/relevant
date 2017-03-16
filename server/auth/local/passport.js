const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'name',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(name, password, done) {
      let formatted =  '^' + name + '$';

      User.findOne({
        '_id': { '$regex': formatted, $options: 'i' }
      }).select('+hashedPassword +salt').exec(function(err, user) {
        if (err) return done(err);

        if (!user) {
          console.log(name, 'name here');
          return done(null, false, { message: 'This name is not registered.' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'This password is not correct.' });
        }
        return done(null, user);
      });
    }
  ));
};