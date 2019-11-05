import express from 'express';
import controller from './earnings.controller';
import auth from '../../auth/auth.service';
// const { asyncMiddleware } = require('../../utils/middlewares');

const router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.put('/:id', auth.isAuthenticated(), controller.updateCashoutLog);

module.exports = router;
