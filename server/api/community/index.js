let express = require('express');
let controller = require('./community.controller');
let auth = require('../../auth/auth.service');

let router = express.Router();

router.post('/', auth.isAuthenticated(), controller.create);

router.put('/:slug/join', auth.isAuthenticated(), controller.join);
router.put('/:slug/leave', auth.isAuthenticated(), controller.leave);
router.get('/:slug/members', auth.isAuthenticated(), controller.members);

router.get('/membership/:user', auth.isAuthenticated(), controller.membership);

router.get('/', controller.index);
router.delete('/:slug', auth.isAuthenticated(), controller.remove);

module.exports = router;
