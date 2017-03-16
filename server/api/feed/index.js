import express from 'express';
import controller from './feed.controller';
import auth from '../../auth/auth.service';

const router = express.Router();

router.get('/', auth.isAuthenticated(), controller.get);
router.get('/post/:id', auth.isAuthenticated(), controller.post);
router.get('/unread', auth.isAuthenticated(), controller.unread);
router.put('/markread', auth.isAuthenticated(), controller.markRead);

module.exports = router;
