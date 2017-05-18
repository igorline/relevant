
let express = require('express');
let controller = require('./relevance.controller');
let auth = require('../../auth/auth.service');

let router = express.Router();

router.get('/', controller.index);
router.get('/user/:id/stats', auth.isAuthenticated(), controller.stats);

module.exports = router;
