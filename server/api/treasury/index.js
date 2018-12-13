
const express = require('express');
const controller = require('./treasury.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.get('/', controller.index);

module.exports = router;
