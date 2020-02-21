const express = require('express');
const passport = require('passport');
const auth = require('../auth.service');
require('./passport');

const router = express.Router();

router.post('/', auth.currentUser(), (req, res, next) => {
  passport.authenticate('web3', async (err, user, info) => {
    const error = err || info;
    if (error) return next(error);
    if (!user)
      return res.status(404).json({ message: 'Something went wrong, please try again.' });

    const token = auth.signToken(user._id, user.role);
    req.universalCookies.set('token', token);

    return res.json({ token });
  })(req, res, next);
});

export default router;
