

const express = require('express');
const controller = require('./message.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.get('/', controller.get);
router.post('/', auth.isAuthenticated(), controller.create);

module.exports = router;
