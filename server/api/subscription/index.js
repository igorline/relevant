const express = require('express');
const controller = require('./subscription.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.get('/user', auth.isAuthenticated(), controller.index);
router.get('/search', controller.search);

module.exports = router;
