const express = require('express');
const controller = require('./user.controller');
// const config = require('../../config/config');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.get('/', controller.index);
router.get('/sendConfirmation', auth.isAuthenticated(), controller.sendConfirmationCode);
router.get('/search', auth.blocked(), controller.search);
router.get('/me', auth.isAuthenticated(), controller.show);
router.get('/blocked', auth.isAuthenticated(), controller.blocked);
router.get('/user/:id', auth.blocked(), controller.show);
router.get('/general/list', auth.blocked(), controller.list);
router.get('/check/user', controller.checkUser);
router.get('/onboarding/:step', auth.isAuthenticated(), controller.onboarding);

router.post('/', controller.create);

router.put('/confirm', controller.confirm);
router.put('/forgot', controller.forgot);
router.put('/resetPassword', controller.resetPassword);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/', auth.isAuthenticated(), controller.update);
router.put('/block', auth.isAuthenticated(), controller.block);
router.put('/unblock', auth.isAuthenticated(), controller.unblock);

router.delete('/:id', auth.hasRole('admin'), controller.destroy);


module.exports = router;
