let express = require('express');
let controller = require('./post.controller');
let auth = require('../../auth/auth.service');

let router = express.Router();

router.post('/', auth.isAuthenticated(), controller.create);
router.post('/sendPostNotification', auth.hasRole('admin'), controller.sendPostNotification);
router.put('/', auth.isAuthenticated(), controller.update);
router.put('/flag', auth.isAuthenticated(), controller.flag);
router.get('/', auth.authMiddleware(), controller.index);
router.get('/readable', controller.readable);
router.get('/topPosts', controller.topPosts);
router.get('/:id', auth.blocked(), controller.findByID);
router.get('/user/:id', auth.blocked(), controller.userPosts);
router.get('/preview/generate', controller.preview);

router.delete('/:id', auth.isAuthenticated(), controller.delete);

console.log(router)
router.stack.forEach(l => {
  console.log(l.route)
})

module.exports = router;
