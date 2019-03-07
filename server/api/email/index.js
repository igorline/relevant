import express from 'express';
import controller from './email.controller';
import auth from '../../auth/auth.service';

const router = express.Router();

router.put('/', auth.hasRole('admin'), controller.index);
router.put('/save', auth.hasRole('admin'), controller.save);
router.get('/load', auth.hasRole('admin'), controller.load);

module.exports = router;
