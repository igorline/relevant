import Auth from '../../auth/auth.service';

let express = require('express');
let controller = require('./metaPost.controller');

let router = express.Router();

router.get('/', Auth.blocked(), controller.index);
router.get('/flagged', Auth.hasRole('admin'), controller.flagged);

// router.get('/:id', controller.getMetaPost);


module.exports = router;

