const express = require('express');
const passport = require('passport');
const auth = require('../auth.service');
const twitter = require('../twitter/passport');

const router = express.Router();

router.post('/', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    try {
      const error = err || info;
      if (error) return res.status(401).json(error);
      if (!user) {
        return res
        .status(404)
        .json({ message: 'Something went wrong, please try again.' });
      }

      if (req.body.twitter) {
        const profile = await twitter.getProfile(req.body.twitter);
        await twitter.addTwitterProfile({
          user,
          profile,
          twitterAuth: req.body.twitter
        });
      }

      user = user.toObject();
      delete user.twitterAuthToken;
      delete user.hashedPassword;
      delete user.salt;
      delete user.twitter;

      const token = auth.signToken(user._id, user.role);
      req.universalCookies.set('token', token);

      return res.json({ token });
    } catch (error) {
      return res.status(404).json({ message: 'Something went wrong, please try again.' });
    }
  })(req, res, next);
});

module.exports = router;
