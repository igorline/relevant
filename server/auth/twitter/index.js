var express = require('express');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter');
var auth = require('../auth.service');
var config = require('../../config/config');

// var Twitter = require('twitter');

var router = express.Router();

router
  .get('/', passport.authenticate('twitter', {
    failureRedirect: '/',
    session: false
  }))

  .get('/callback', passport.authenticate('twitter', {
    failureRedirect: '/',
    session: false
  }), auth.setTokenCookie)

  .post('/login', (req, res, next) => {
    let authToken = req.body.authToken;
    let authTokenSecret = req.body.authTokenSecret;
    let user_id = req.body.user_id;
    let url = 'https://api.twitter.com/1.1/users/show.json';
    let twitter = new TwitterStrategy({
      consumerKey: process.env.TWITTER_ID,
      consumerSecret: process.env.TWITTER_SECRET,
      callbackURL: config.twitter.callbackURL,
      passReqToCallback: true,
      includeEmail: true,
    }, () => null);

    twitter.userProfile(authToken,
      authTokenSecret,
      { url, user_id },
      (error, profile) => {
        if (error) return res.send(501, error.message);
        console.log(profile);
        return res.json(200, JSON.stringify(profile._json));
      });
  });

module.exports = router;