let express = require('express');
let controller = require('./tag.controller');
let auth = require('../../auth/auth.service');
let router = express.Router();

router.post('/', auth.hasRole('admin'), controller.create);
router.put('/categories', auth.hasRole('admin'), controller.update);
router.get('/', controller.index);
router.get('/categories', controller.categories);
router.get('/search/:term', controller.search);

module.exports = router;
