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
  app.use('/api/metapost', require('./api/metaPost'));
  // app.use('/subdomain/:subdomain/api/post', require('./api/post'));
  // app.use('/subdomain/:subdomain/api/metapost', require('./api/metaPost'));

  // app.use('/subdomain/:subdomain/api/feed', require('./api/feed'));
  app.use('/api/feed', require('./api/feed'));

  app.use('/api/subscription', require('./api/subscription'));

  app.use('/api/invest', require('./api/invest'));
  app.use('/api/tag', require('./api/tag'));
  // app.use('/subdomain/:subdomain/api/invest', require('./api/invest'));
  // app.use('/subdomain/:subdomain/api/tag', require('./api/tag'));

  app.use('/api/notification', require('./api/notification'));
  // app.use('/api/tagparent', require('./api/tagParent'));
  app.use('/api/comment', require('./api/comment'));
  // app.use('/api/message', require('./api/message'));
  app.use('/api/metatag', require('./api/metatag'));
  app.use('/api/statistics', require('./api/statistics'));
  app.use('/api/earnings', require('./api/earnings'));

  app.use('/api/relevance', require('./api/relevance'));
  // app.use('/subdomain/:subdomain/api/relevance', require('./api/relevance'));

  app.use('/api/treasury', require('./api/treasury'));
  app.use('/api/list', require('./api/emailList'));
  app.use('/api/invites', require('./api/invites'));
  app.use('/api/relevanceStats', require('./api/relevanceStats'));
  app.use('/api/email', require('./api/email'));
  app.use('/api/twitterFeed', require('./api/twitterFeed'));
  app.use('/api/communityFeed', require('./api/communityFeed'));

  app.use('/api/community', require('./api/community'));

  app.get('/confirm/:user/:code', userController.confirm);

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
