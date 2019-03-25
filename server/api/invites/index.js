import express from 'express';
import controller from './invite.controller';
import auth from '../../auth/auth.service';

const router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/count', auth.isAuthenticated(), auth.communityMember(), controller.count);

router.put('/', auth.isAuthenticated(), controller.adminInvite);

router.post('/', auth.isAuthenticated(), auth.communityMember(), controller.create);
router.post('/email', auth.isAuthenticated(), controller.sendEmail);

router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
