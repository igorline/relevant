import { utils } from 'ethers';
import { Strategy } from 'passport-custom';
import passport from 'passport';
import User from 'server/api/user/user.model';

passport.use(
  'web3',
  new Strategy(async (req, callback) => {
    try {
      const user = await authorizeUser(req);
      if (!user) throw new Error('User not found');
      return callback(null, user);
    } catch (err) {
      return callback(err);
    }
  })
);

export async function authorizeUser(req) {
  const sigAddress = verifyEthSignature(req.body);
  // user is already logged in
  if (req.user) {
    req.user.ethLogin = sigAddress;
    await req.user.save();
    return req.user;
  }
  return User.findOne({ ethLogin: sigAddress });
}

export function verifyEthSignature({ signature, msg }) {
  if (!signature || !msg) throw Error('Missing signature parameters');
  const sigAddress = utils.verifyMessage(JSON.stringify(msg), signature);

  if (sigAddress !== msg.address) throw new Error("Signature doesn't match");

  const { exp } = msg;
  const claimExp = new Date(exp * 1000);
  if (claimExp < new Date()) throw new Error('This signature is expired');
  return sigAddress;
}
