const express = require('express');
const controller = require('./comment.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.get('/', auth.blocked(), controller.get);
router.post('/', auth.isAuthenticated(), auth.communityMember(), controller.create);
router.delete('/:id', auth.isAuthenticated(), controller.delete);
router.put('/', auth.isAuthenticated(), controller.update);

module.exports = router;
