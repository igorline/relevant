const express = require('express');
const passport = require('passport');
const auth = require('../auth.service');
const Controller = require('./passport');

// var Twitter = require('twitter');
let router = express.Router();


router.get('/', (req, res, next) => {
  passport.authenticate('twitter', {
    failureRedirect: '/login',
    session: false
  })(req, res, next);
});

router.get('/callback', passport.authenticate('twitter', {
  failureRedirect: '/login',
  session: false
}), auth.setTokenCookieDesktop);

router.post('/login', auth.currentUser(), Controller.login, auth.setTokenCookie);

module.exports = router;
