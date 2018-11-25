import Auth from '../../auth/auth.service';

let asyncMiddleware = require('../../utils/middlewares').asyncMiddleware;
let express = require('express');
let controller = require('./link.controller');

let router = express.Router();

router.get('/flagged', Auth.hasRole('admin'), controller.flagged);
router.get('/related/:id', asyncMiddleware(controller.related));
router.get('/', Auth.blocked(), controller.index);

// router.get('/:id', controller.getMetaPost);


module.exports = router;

