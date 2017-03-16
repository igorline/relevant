
let express = require('express');
let controller = require('./treasury.controller');
let auth = require('../../auth/auth.service');

let router = express.Router();

router.get('/', controller.index);

module.exports = router;
