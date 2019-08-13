import express from 'express';
import controller from './invest.controller';
import auth from '../../auth/auth.service';

const router = express.Router();

router.post('/bet', auth.isAuthenticated(), auth.communityMember(), controller.bet);

router.post('/', auth.isAuthenticated(), auth.communityMember(), controller.create);
router.get('/downvotes', auth.hasRole('admin'), controller.downvotes);
router.get('/:userId', auth.blocked(), auth.communityMember(), controller.show);
router.get('/post/:postId', auth.authMiddleware(), controller.postInvestments);

module.exports = router;
