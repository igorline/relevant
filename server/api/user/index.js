const express = require('express');
const controller = require('./user.controller');
// const config = require('../../config/config');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.get('/', controller.index);
router.put('/confirm', controller.confirm);
router.get('/sendConfirmation', auth.isAuthenticated(), controller.sendConfirmationCode);
router.put('/forgot', controller.forgot);
router.put('/resetPassword', controller.resetPassword);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/search', controller.search);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.show);
router.get('/:id', auth.currentUser(), controller.show);
router.post('/', controller.create);
router.put('/', auth.isAuthenticated(), controller.update);
router.get('/general/list', controller.list);
router.get('/check/user', controller.checkUser);
router.get('/onboarding/:step', auth.isAuthenticated(), controller.onboarding);

module.exports = router;
