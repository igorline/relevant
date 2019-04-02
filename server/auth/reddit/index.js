const express = require('express');
const passport = require('passport');
const auth = require('../auth.service');
const config = require('../../config/config');

const router = express.Router();

router.get('/', auth.currentUser(), (req, res, next) => {
  req.invitecode = req.query.invitecode;
  passport.authenticate('reddit', {
    callbackURL: config.reddit.callbackURL,
    duration: 'permanent',
    state: '?redirect=' + req.query.redirect + '&invitecode=' + req.query.invitecode,
    failureRedirect: '/user/login',
    session: false,
    scope: 'identity'
  })(req, res, next);
});

router.get(
  '/callback',
  auth.currentUser(),
  passport.authenticate('reddit', {
    failureRedirect: '/user/login',
    session: false
  }),
  auth.setTokenCookieDesktop
);

module.exports = router;
