const express = require('express');
const controller = require('./user.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

// router.get('/confirm/:user/:code', controller.confirm);
router.get('/', auth.isAuthenticated(), controller.index);
router.get('/sendConfirmation', auth.isAuthenticated(), controller.sendConfirmationCode);
router.get('/search', auth.blocked(), controller.search);
router.get('/me', auth.isAuthenticated(), controller.show);
router.get('/blocked', auth.isAuthenticated(), controller.blocked);
router.get('/user/:id', auth.blocked(), controller.show);
router.get('/general/list', auth.blocked(), controller.list);
router.get('/testData', controller.testData);
router.get('/check/user', controller.checkUser);

router.post('/', controller.create);
router.post('/cashOut', auth.isAuthenticated(), controller.cashOut);

router.get('/onboarding/:step', auth.isAuthenticated(), controller.onboarding);
router.put('/webonboard/:step', auth.isAuthenticated(), controller.webOnboard);
router.put(
  '/updateUserTokenBalance',
  auth.isAuthenticated(),
  controller.updateUserTokenBalance
);
router.put(
  '/updateHandle',
  auth.isAuthenticated(),
  controller.updateHandle,
  auth.setTokenCookieDesktop
);
router.put('/updateCommunity', auth.isAuthenticated(), controller.updateComunity);
router.put('/ethAddress', auth.isAuthenticated(), controller.ethAddress);
router.put('/confirm', controller.confirm);
router.put('/forgot', controller.forgot);
router.put('/resetPassword', controller.resetPassword);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/', auth.isAuthenticated(), controller.update);
router.put('/block', auth.isAuthenticated(), controller.block);
router.put('/unblock', auth.isAuthenticated(), controller.unblock);

router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
