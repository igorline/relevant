

const express = require('express');
const controller = require('./tagParent.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

// router.post('/', auth.isAuthenticated(), controller.create);
router.get('/', controller.index);

module.exports = router;
