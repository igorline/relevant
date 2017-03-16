import express from 'express';
import controller from './earnings.controller';
import auth from '../../auth/auth.service';

const router = express.Router();

router.get('/', auth.isAuthenticated(), controller.get);

module.exports = router;
