let express = require('express');
let controller = require('./subscription.controller');
let auth = require('../../auth/auth.service');
let router = express.Router();

// router.post('/', auth.isAuthenticated(), controller.create);
router.get('/user', auth.isAuthenticated(), controller.index);
router.get('/search', controller.search);

module.exports = router;
