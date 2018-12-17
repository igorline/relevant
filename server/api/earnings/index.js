import express from 'express';
import controller from './earnings.controller';

const { asyncMiddleware } = require('../../utils/middlewares');

const router = express.Router();

router.get('/', asyncMiddleware(controller.get));

module.exports = router;
