const express = require('express');
const passport = require('passport');
const auth = require('../auth.service');
const controller = require('./passport');

const router = express.Router();

router.get('/', (req, res, next) => {
  passport.authenticate('twitter', {
    failureRedirect: '/login',
    session: false
  })(req, res, next);
});

router.get('/callback',
  auth.currentUser(),
  passport.authenticate('twitter', {
    failureRedirect: '/login',
    session: false
  }),
  auth.setTokenCookieDesktop
);

router.post('/login',
  auth.currentUser(),
  controller.nativeAuth
);


module.exports = router;
