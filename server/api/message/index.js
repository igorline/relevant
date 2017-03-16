'use strict';

var express = require('express');
var controller = require('./message.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/', controller.get);
router.post('/', auth.isAuthenticated(), controller.create);

module.exports = router;