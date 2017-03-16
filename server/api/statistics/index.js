'use strict';

var express = require('express');
var controller = require('./statistics.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

// router.post('/', auth.isAuthenticated(), controller.create);
router.get('/all', controller.index);
router.get('/', auth.isAuthenticated(), controller.chart);
router.get('/change', auth.isAuthenticated(), controller.change);
router.get('/:id', controller.chart);
router.get('/change/:id', controller.change);
// router.put('/irrelevant/:id', auth.isAuthenticated(), controller.irrelevant);
// router.get('/recent', controller.recent);
// router.get('/user/:id', auth.currentUser(), controller.findByUserID);
// router.delete('/:id', auth.isAuthenticated(), controller.delete);

module.exports = router;
