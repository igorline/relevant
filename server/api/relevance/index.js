
const express = require('express');
const controller = require('./relevance.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.get('/', controller.index);
router.get('/user/:id/stats', auth.isAuthenticated(), controller.stats);

module.exports = router;
