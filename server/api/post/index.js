let express = require('express');
let controller = require('./post.controller');
let auth = require('../../auth/auth.service');

let router = express.Router();

router.post('/', auth.isAuthenticated(), controller.create);
router.put('/', auth.isAuthenticated(), controller.update);
router.put('/flag', auth.isAuthenticated(), controller.flag);
router.get('/', auth.authMiddleware(), controller.index);
router.get('/:id', auth.authMiddleware(), controller.findByID);
router.get('/user/:id', auth.authMiddleware(), controller.userPosts);
router.get('/preview/generate', controller.preview);
router.delete('/:id', auth.isAuthenticated(), controller.delete);

module.exports = router;
