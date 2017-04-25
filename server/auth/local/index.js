const express = require('express');
const passport = require('passport');
const auth = require('../auth.service');

let router = express.Router();

router.post('/', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    let error = err || info;
    console.log(error);
    if (error) return res.status(401).json(error);
    if (!user) return res.status(404).json({ message: 'Something went wrong, please try again.' });

    let token = auth.signToken(user._id, user.role);

    res.json({ token });
  })(req, res, next);
});

module.exports = router;
