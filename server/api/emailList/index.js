import express from 'express';
import controller from './list.controller';
import auth from '../../auth/auth.service';

const router = express.Router();

router.post('/', controller.addWaitlist);
router.get('/', controller.index);

module.exports = router;
