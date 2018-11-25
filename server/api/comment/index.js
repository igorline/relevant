let express = require('express');
let controller = require('./comment.controller');
let auth = require('../../auth/auth.service');
let router = express.Router();

router.get('/', auth.blocked(), controller.get);
router.post('/', auth.isAuthenticated(), auth.communityMember(), controller.create);
router.delete('/:id', auth.isAuthenticated(), controller.delete);
router.put('/', auth.isAuthenticated(), controller.update);

module.exports = router;