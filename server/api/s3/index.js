const express = require('express');
const controller = require('./s3.controller');

const router = express.Router();

router.get('/sign', controller.sign);

module.exports = router;
