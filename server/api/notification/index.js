const express = require('express');
const controller = require('./notification.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.post('/', auth.isAuthenticated(), controller.create);
router.put('/markread', auth.isAuthenticated(), controller.markRead);
router.get('/unread', auth.isAuthenticated(), controller.unread);
router.get('/', auth.isAuthenticated(), controller.show);
// router.get('/general', auth.isAuthenticated(), controller.showGeneral);

module.exports = router;
