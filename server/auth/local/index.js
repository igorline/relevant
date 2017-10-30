const express = require('express');
const passport = require('passport');
const auth = require('../auth.service');
const twitter = require('../twitter/passport');

let router = express.Router();

router.post('/', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    try {
      let error = err || info;
      console.log(error);
      if (error) return res.status(401).json(error);
      if (!user) return res.status(404).json({ message: 'Something went wrong, please try again.' });

      if (req.body.twitter) {
        let profile = await twitter.getProfile(req.body.twitter);
        let updatedUser = await twitter.addTwitterProfile({
          user, profile, twitterAuth: req.body.twitter
        });
      }

      user = user.toObject();
      delete user.twitterAuthToken;
      delete user.hashedPassword;
      delete user.salt;
      delete user.twitter;

      let token = auth.signToken(user._id, user.role);

      res.json({ token });
    } catch (error) {
      console.log(error);
    }
  })(req, res, next);
});

module.exports = router;
