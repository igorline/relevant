'use strict';

var express = require('express');
var controller = require('./s3.controller');

var router = express.Router();

// router.get('/', controller.index);
// router.get('/:id', controller.show);
router.post('/upload', controller.upload);
router.get('/uploadFromURL', controller.uploadFromURL);
// router.post('/uploadBase', controller.uploadBase);
router.get('/sign', controller.sign);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;
