import Auth from '../../auth/auth.service';

const asyncMiddleware = require('../../utils/middlewares').asyncMiddleware;
const express = require('express');
const controller = require('./link.controller');

const router = express.Router();

router.get('/flagged', Auth.hasRole('admin'), controller.flagged);
router.get('/related/:id', asyncMiddleware(controller.related));
router.get('/', Auth.blocked(), controller.index);

// router.get('/:id', controller.getMetaPost);


module.exports = router;

