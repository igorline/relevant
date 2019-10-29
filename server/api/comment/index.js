const express = require('express');
const controller = require('./comment.controller');
const auth = require('../../auth/auth.service');
const { asyncMiddleware } = require('../../utils/middlewares');

const router = express.Router();

router.get('/', auth.blocked(), asyncMiddleware(controller.index));
router.post('/', auth.isAuthenticated(), auth.communityMember(), controller.create);
router.delete('/:id', auth.isAuthenticated(), controller.delete);
router.put('/', auth.isAuthenticated(), controller.update);

module.exports = router;
