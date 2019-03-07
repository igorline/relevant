const express = require('express');
const controller = require('./statistics.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.get('/user', auth.isAuthenticated(), auth.communityMember(), controller.user);

module.exports = router;
