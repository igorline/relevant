const express = require('express');
const controller = require('./logger.controller');

const router = express.Router();

router.post('/logError', controller.logError);

module.exports = router;
