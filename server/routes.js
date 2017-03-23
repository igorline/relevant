import handleRender from './render';
import { currentUser } from './auth/auth.service';
import userController from './api/user/user.controller';

let express = require('express');

function requireHTTPS(req, res, next) {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  return next();
}

module.exports = (app) => {
  app.use(requireHTTPS);
  // API
  app.use('/api/user', require('./api/user'));
  app.use('/api/s3', require('./api/s3'));
  app.use('/auth', require('./auth'));
  app.use('/api/post', require('./api/post'));
  app.use('/api/metapost', require('./api/metaPost'));
  app.use('/api/feed', require('./api/feed'));
  app.use('/api/subscription', require('./api/subscription'));
  app.use('/api/invest', require('./api/invest'));
  app.use('/api/tag', require('./api/tag'));
  app.use('/api/notification', require('./api/notification'));
  // app.use('/api/tagparent', require('./api/tagParent'));
  app.use('/api/comment', require('./api/comment'));
  app.use('/api/message', require('./api/message'));
  app.use('/api/metatag', require('./api/metatag'));
  app.use('/api/statistics', require('./api/statistics'));
  app.use('/api/earnings', require('./api/earnings'));
  app.use('/api/relevance', require('./api/relevance'));
  app.use('/api/treasury', require('./api/treasury'));

  app.get('/confirm/:user/:code', userController.confirm);

  app.get('/*', currentUser(), handleRender);
};
