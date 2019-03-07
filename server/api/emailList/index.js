import express from 'express';
import controller from './list.controller';
import auth from '../../auth/auth.service';

const { asyncMiddleware } = require('../../utils/middlewares');

const router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);

router.post('/', controller.addWaitlist);

router.delete('/:id', auth.hasRole('admin'), controller.delete);

router.put('/', auth.hasRole('admin'), asyncMiddleware(controller.invite));
// router.put('/:id', controller.update);

module.exports = router;
