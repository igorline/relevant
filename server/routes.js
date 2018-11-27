import handleRender from './render';
import { currentUser } from './auth/auth.service';
import userController from './api/user/user.controller';

let express = require('express');

function handleError(res, err) {
  console.log(err);
  return res.status(500).json({ message: err.message });
}

let base;
if (process.env.NODE_ENV === 'production') {
  base = 'relevant.community';
} else {
  base = 'localhost';
}

const subdomainOptions = { base, removeWWW: true };

module.exports = (app) => {
  app.use(require('./utils/subdomain')(subdomainOptions));

  // app.use('/subdomain/:subdomain', (req, res, next) => {
  //   req.community = req.query.subdomain;
  //   next();
  // });

  // API
  app.use('/api/user', require('./api/user'));
  app.use('/api/s3', require('./api/s3'));
  app.use('/auth', require('./auth'));
  app.use('/api/post', require('./api/post'));
  app.use('/api/links', require('./api/links'));
  app.use('/api/feed', require('./api/feed'));
  app.use('/api/subscription', require('./api/subscription'));
  app.use('/api/invest', require('./api/invest'));
  app.use('/api/tag', require('./api/tag'));
  app.use('/api/notification', require('./api/notification'));
  app.use('/api/comment', require('./api/comment'));
  app.use('/api/statistics', require('./api/statistics'));
  app.use('/api/earnings', require('./api/earnings'));
  app.use('/api/relevance', require('./api/relevance'));
  app.use('/api/treasury', require('./api/treasury'));
  app.use('/api/list', require('./api/emailList'));
  app.use('/api/invites', require('./api/invites'));
  app.use('/api/relevanceStats', require('./api/relevanceStats'));
  app.use('/api/email', require('./api/email'));
  app.use('/api/twitterFeed', require('./api/twitterFeed'));
  app.use('/api/communityFeed', require('./api/communityFeed'));
  app.use('/api/community', require('./api/community'));
  app.get('/confirm/:user/:code', userController.confirm);

  // TODO - check if community exists here and redirect if not
  app.use('/home', (req, res) => res.redirect('/relevant/new'));


  // Default response middleware
  app.use((req, res, next) => {
    if (res.jsonResponse) {
      res.status(200).json(res.jsonResponse);
    } else next();
  });

  // Error handler route
  app.use((err, req, res, next) => {
    console.error(err);
    return res.status(500).json({ message: err.message });
  });

  // app.get('/subdomain/:subdomain/*', currentUser(), handleRender);
  app.get('/*', currentUser(), handleRender);

};
