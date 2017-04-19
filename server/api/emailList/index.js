import express from 'express';
import controller from './list.controller';
import auth from '../../auth/auth.service';

const router = express.Router();

router.get('/', controller.index);

router.post('/', controller.addWaitlist);

// router.put('/:id', controller.update);

module.exports = router;
