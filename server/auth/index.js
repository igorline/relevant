

const express = require('express');
const passport = require('passport');
const config = require('../config/config');
const User = require('../api/user/user.model');

const auth = require('./auth.service');


// Passport Configuration
require('./local/passport').setup(User, config);
require('./twitter/passport').setup(User, config);
require('./facebook/passport').setup(User, config);
// require('./google/passport').setup(User, config);


const router = express.Router();

router.use('/local', require('./local'));
router.use('/facebook', require('./facebook'));
router.use('/twitter', require('./twitter'));
// router.use('/google', require('./google'));

module.exports = router;

