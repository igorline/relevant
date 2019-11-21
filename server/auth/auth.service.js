import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import AuthToken from 'server/api/token/token.model';
import config from '../config/config';
import User from '../api/user/user.model';
import CommunityMember from '../api/community/community.member.model';
import Community from '../api/community/community.model';

const secret = process.env.SESSION_SECRET;

const validateJwt = expressJwt({
  secret,
  ignoreExpiration: true,
  isRevoked
});

async function verify(token) {
  const user = jwt.verify(token, secret, { ignoreExpiration: true });
  const revoked = await AuthToken.checkRevoked(user);
  if (revoked) return null;
  return user;
}

async function isRevoked(req, payload, done) {
  const revoked = await AuthToken.checkRevoked(payload);
  if (revoked) console.log('token is revoked', payload); // eslint-disable-line
  if (revoked) return done(null, true);
  return done();
}

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
  return validateJwt(req, res, err => {
    if (token && err) {
      console.log('REMOVING TOKEN', err); // eslint-disable-line
      req.universalCookies.remove('token');
    }
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
        console.log("User doesn't exist - bad token", req.user);
        req.universalCookies.remove('token');
      }

      req.user = user;
      return next();
    } catch (err) {
      req.user = null;
      req.universalCookies.remove('token');
      return next();
    }
  };
}

function blocked() {
  return compose()
    .use(validateTokenLenient)
    .use(getUser('+blocked +blockedBy'));
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
    .use(getUser('+email'));
}

function communityMember(role) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user._id) {
        throw new Error('missing user credentials');
      }
      const user = req.user._id;
      const community = req.query.community || 'relevant';
      let member = await CommunityMember.findOne({ user, community });

      // add member to default community
      if (!member) {
        // TODO join community that one is signing up with
        const com = await Community.findOne({ slug: community });
        // TODO private communities
        if (!com || com.private) throw new Error("Community doesn't exist");

        member = await com.join(user);
        if (!member.community) {
          member.community = com.slug;
          member = await member.save();
        }
      }

      if (role === 'superAdmin' && !member.superAdmin && req.user.role !== 'admin') {
        throw new Error("You don't have the priveleges required to do this");
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
exports.validateTokenLenient = validateTokenLenient;
exports.verify = verify;
