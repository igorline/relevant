'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/config');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/search', controller.search);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.show);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.currentUser(), controller.show);
router.post('/', controller.create);
router.put('/', auth.isAuthenticated(), controller.update);
router.get('/general/list', controller.list);
router.get('/check/:name', controller.checkUsername);
router.get('/onboarding/:step', auth.isAuthenticated(), controller.onboarding);

module.exports = router;
