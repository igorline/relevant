import express from 'express';
import controller from './invite.controller';
import auth from '../../auth/auth.service';

const router = express.Router();

router.post('/', auth.hasRole('admin'), controller.create);
router.post('/email', auth.hasRole('admin'), controller.sendEmail);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.put('/', controller.checkInviteCode);
router.get('/', auth.hasRole('admin'), controller.index);

module.exports = router;
