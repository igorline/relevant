let express = require('express');
let controller = require('./community.controller');
let auth = require('../../auth/auth.service');

let router = express.Router();

router.post('/', auth.isAuthenticated(), controller.create);
router.get('/', controller.index);
router.delete('/:slug', controller.remove);

// router.get('/members', controller.members);

module.exports = router;
