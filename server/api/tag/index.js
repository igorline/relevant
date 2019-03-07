const express = require('express');
const controller = require('./tag.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.post('/', auth.hasRole('admin'), controller.create);
router.put('/categories', auth.hasRole('admin'), controller.update);
router.get('/', controller.index);
router.get('/categories', controller.categories);
router.get('/search/:term', controller.search);

module.exports = router;
