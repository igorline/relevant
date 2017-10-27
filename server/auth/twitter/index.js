const express = require('express');
const passport = require('passport');
const auth = require('../auth.service');
const Controller = require('./passport');

// var Twitter = require('twitter');
let router = express.Router();

router
  .get('/', passport.authenticate('twitter', {
    failureRedirect: '/',
    session: false
  }))

  .get('/callback', passport.authenticate('twitter', {
    failureRedirect: '/',
    session: false
  }), auth.setTokenCookie)

  .post('/login', Controller.login, auth.setTokenCookie);

module.exports = router;
