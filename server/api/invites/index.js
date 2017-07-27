import express from 'express';
import controller from './invite.controller';
import auth from '../../auth/auth.service';

const router = express.Router();

router.post('/', auth.isAuthenticated(), controller.create);
router.post('/email', auth.isAuthenticated(), controller.sendEmail);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.put('/', controller.checkInviteCode);
router.get('/', auth.isAuthenticated(), controller.index);

module.exports = router;
