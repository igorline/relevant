import express from 'express';
import controller from './relevanceStats.controller';
import auth from '../../auth/auth.service';

const router = express.Router();

router.get('/all', controller.index);
router.get('/user', auth.isAuthenticated(), controller.user);

module.exports = router;
