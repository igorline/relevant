const express = require('express');
const passport = require('passport');
const auth = require('../auth.service');
const controller = require('./passport');
const config = require('../../config/config');

const router = express.Router();

router.get('/', auth.currentUser(), (req, res, next) => {
  req.invitecode = req.query.invitecode;
  passport.authenticate('twitter', {
    callbackURL: config.twitter.callbackURL + `?invitecode=${req.query.invitecode}`,
    failureRedirect: '/user/login',
    session: false
  })(req, res, next);
});

router.get(
  '/callback',
  auth.currentUser(),
  passport.authenticate('twitter', {
    failureRedirect: '/user/login',
    session: false
  }),
  auth.setTokenCookieDesktop
);

router.post('/user/login', auth.currentUser(), controller.nativeAuth);

module.exports = router;
