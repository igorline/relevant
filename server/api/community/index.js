const express = require('express');
const controller = require('./community.controller');
const auth = require('../../auth/auth.service');

const router = express.Router();

router.get('/:slug/members', auth.blocked(), controller.members);
// Search by embedded user handle and name
router.get('/:slug/members/search', auth.blocked(), controller.memberSearch);
router.get('/membership/:user', auth.isAuthenticated(), controller.membership);
router.get('/', controller.index);
router.get('/:slug', auth.isAuthenticated(), controller.findOne);

router.post('/', auth.isAuthenticated(), controller.create);

router.put(
  '/:slug',
  auth.isAuthenticated(),
  auth.communityMember('superAdmin'),
  controller.update
);
router.put('/:slug/join', auth.isAuthenticated(), controller.join);
router.put('/:slug/leave', auth.isAuthenticated(), controller.leave);

router.delete('/:slug', auth.isAuthenticated(), controller.remove);

module.exports = router;
