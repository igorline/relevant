'use strict';

var express = require('express');
var controller = require('./tagParent.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

// router.post('/', auth.isAuthenticated(), controller.create);
router.get('/', controller.index);

module.exports = router;
