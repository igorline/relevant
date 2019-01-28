import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import config from '../config/config';
import User from '../api/user/user.model';
import CommunityMember from '../api/community/community.member.model';
import Community from '../api/community/community.model';

const validateJwt = expressJwt({
  secret: process.env.SESSION_SECRET,
  ignoreExpiration: true
});

// doesn't throw error if user is not authenticated
function validateTokenLenient(req, res, next) {
  const { token } = req.cookies;
  if (token) {
    req.headers.authorization = 'Bearer ' + token;
  } else if (
    req.query &&
    Object.prototype.hasOwnProperty.call(req.query, 'access_token')
  ) {
    req.headers.authorization = 'Bearer ' + req.query.access_token;
  }
  return validateJwt(req, res, (err) => {
    if (token && err) req.universalCookies.remove('token');
    next();
  });
}

// throws error if user is not authenticated
function validateTokenStrict(req, res, next) {
  const { token } = req.cookies;
  if (token) {
    req.headers.authorization = 'Bearer ' + token;
  } else if (
    req.query &&
    Object.prototype.hasOwnProperty.call(req.query, 'access_token')
  ) {
    req.headers.authorization = 'Bearer ' + req.query.access_token;
  }
  return validateJwt(req, res, next);
}

function getUser(select) {
  return async (req, res, next) => {
    try {
      if (!req.user) return next();
      const user = await User.findById(req.user._id, select);

      if (!user) {
        // eslint-disable-next-line
        console.log('User doesn\'t exist - bad token', req.user);
        req.universalCookies.remove('token');
      }

      req.user = user;
      return next();
    } catch (err) {
      return next();
    }
  };
}

function blocked() {
  return compose()
  .use(validateTokenLenient)
  .use(getUser('blocked blockedBy'));
}

function currentUser() {
  return compose()
  .use(validateTokenLenient)
  .use(getUser());
}

function authMiddleware() {
  return validateTokenStrict;
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
  .use(validateTokenStrict)
  .use(getUser());
}

function communityMember() {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        throw new Error('missing user credentials');
      }
      const user = req.user._id;
      // TODO make sure share extension supports this
      const community = req.query.community || 'relevant';
      let member = await CommunityMember.findOne({ user, community });

      // add member to default community
      if (!member) {
      // if (community === 'relevant' && !member) {
        // TODO join community that one is signing up with
        const com = await Community.findOne({ slug: community });
        await com.join(user);
        member = await CommunityMember.findOne({ user, community });
      }

      if (!member) throw new Error('you are not a member of this community');
      // TODO grab user reputation & figure out permission level
      req.communityMember = member;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');
  return compose()
  .use(isAuthenticated())
  .use((req, res, next) => {
    if (
      config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)
    ) {
      next();
    } else {
      res.sendStatus(403);
    }
  });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id, role) {
  return jwt.sign({ _id: id, role }, process.env.SESSION_SECRET, { expiresIn: '7 days' });
}

function setTokenNative(req, res) {
  if (!req.user) {
    return res.json(404, { message: 'Something went wrong, please try again.' });
  }

  const token = signToken(req.user._id, req.user.role);
  req.universalCookies.set('token', token);

  return res.json({ token, user: req.user });
}

function setTokenCookieDesktop(req, res) {
  if (!req.user) {
    return res.json(404, { message: 'Something went wrong, please try again.' });
  }

  const token = signToken(req.user._id, req.user.role);
  req.universalCookies.set('token', token);

  const redirect = req.query.redirect || '/relevant/new';
  return res.redirect(redirect);
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) {
    return res.json(404, { message: 'Something went wrong, please try again.' });
  }

  const token = signToken(req.user._id, req.user.role);
  req.universalCookies.set('token', token);

  return res.redirect('/signup');
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.authMiddleware = authMiddleware;
exports.currentUser = currentUser;
exports.blocked = blocked;
exports.setTokenCookieDesktop = setTokenCookieDesktop;
exports.communityMember = communityMember;
exports.setTokenNative = setTokenNative;
