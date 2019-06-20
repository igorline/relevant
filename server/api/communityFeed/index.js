import express from 'express';
import controller from './communityFeed.controller';
import auth from '../../auth/auth.service';
import { asyncMiddleware } from '../../utils/middlewares';

const router = express.Router();

router.get('/', auth.blocked(), asyncMiddleware(controller.index));

module.exports = router;
