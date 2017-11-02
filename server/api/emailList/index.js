import express from 'express';
import controller from './list.controller';
import auth from '../../auth/auth.service';

const router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);

router.post('/', controller.addWaitlist);

router.delete('/:id', auth.hasRole('admin'), controller.delete);

// router.put('/:id', controller.update);

module.exports = router;
