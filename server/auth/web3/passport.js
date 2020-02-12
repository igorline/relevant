import { utils } from 'ethers';
import { Strategy } from 'passport-custom';
import passport from 'passport';
import User from 'server/api/user/user.model';

passport.use(
  'web3',
  new Strategy(async (req, callback) => {
    const { signature, msg } = req.body;
    const sigAddress = utils.verifyMessage(JSON.stringify(msg), signature);

    if (sigAddress !== msg.address) return callback(new Error("Signature doesn't match"));

    const { exp } = msg;
    const claimExp = new Date(exp * 1000);
    if (claimExp < new Date()) return callback(new Error('This signature is expired'));

    const user = await User.findOne({ boxAddress: sigAddress });
    if (!user) return callback(new Error('User not found'));

    return callback(null, user);
  })
);
