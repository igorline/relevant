'use strict';

var express = require('express');
var controller = require('./comment.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/', auth.blocked(), controller.get);
router.post('/', auth.isAuthenticated(), controller.create);
router.delete('/:id', auth.isAuthenticated(), controller.delete);
router.put('/', auth.isAuthenticated(), controller.update);

module.exports = router;