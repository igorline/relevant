import express from 'express';
import controller from './earnings.controller';
import auth from '../../auth/auth.service';

const asyncMiddleware = require('../../utils/middlewares').asyncMiddleware;

const router = express.Router();

router.get('/', asyncMiddleware(controller.get));

module.exports = router;
