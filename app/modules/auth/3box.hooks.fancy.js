/* eslint-disable no-console */
import { useEffect, useCallback } from 'react';
import { useWeb3 } from 'modules/contract/contract.hooks';
import Box from '3box';
import { alert } from 'utils';
import { utils, Wallet } from 'ethers';
import IdentityWallet from 'identity-wallet';
import { local } from 'utils/storage';
import { getProfile, getVerifiedAccounts } from '3box/lib/api';

let idWallet;
let box;

const Alert = alert.Alert();
export function use3BoxProfile({ address, metamask, setProfile }) {
  return useEffect(() => {
    if (!address || !metamask) return;
    const init3Box = async () => {
      try {
        const mnemonic = getMnemonic();
        const seed = utils.HDNode.mnemonicToSeed(mnemonic);
        idWallet = new IdentityWallet(async () => true, { seed });
        await idWallet.authenticate(['relevant', '3Box']);
        await idWallet.linkAddress(address, metamask);
        const provider = await idWallet.get3idProvider();

        box = await Box.openBox(address, provider);

        const relevantSpace = await box.openSpace('relevant');
        const relevantProfile = await relevantSpace.public.all();

        console.log('relevantProfile', relevantProfile);
        // await relevantSpace.syncDone;
        // await Promise.all([box.syncDone]);

        if (relevantProfile.defaultProfile === 'relevant') {
          const email = await relevantSpace.private.get('email');
          // console.log('got email', email);
          const { signature, DID } = await signClaim(idWallet, address);
          return setProfile([null, { ...relevantProfile, email, signature, DID }]);
        }

        const boxProfile = await getProfile(address);
        const verified = await getVerifiedAccounts(boxProfile);
        console.log(boxProfile);
        console.log(verified);

        await relevantSpace.public.set('defaultProfile', '3box');

        const emailObj = await box.verified.email();
        // console.log('emailObj', emailObj);
        const email = emailObj && emailObj.email_address;

        // TODO - this is actually insecure! we need a separate signature for ETH address!

        const { signature, DID } = await signClaim(idWallet, address);

        return setProfile([null, { ...boxProfile, signature, DID, email }]);
      } catch (err) {
        // console.log(err);
        Alert.alert(err.message);
        return setProfile([err.message]);
      }
    };
    init3Box();
  }, [address]); // eslint-disable-line
}

export function useUpdateProfile() {
  const [accounts] = useWeb3();
  // const metamask = useMetamask();
  const address = accounts && utils.getAddress(accounts[0]);
  return useCallback(
    async profile => {
      if (!box) return;
      const relevantSpace = await box.openSpace('relevant');
      // doesn't fire
      // await relevantSpace.syncDone;
      await Promise.all([box.syncDone]);
      const imageObject = profile.image && [
        {
          '@type': 'ImageObject',
          contentUrl: profile.image
        }
      ];
      // for some reason this doesn't work?
      await relevantSpace.public.set('defaultProfile', 'relevant');
      await relevantSpace.public.set('image', imageObject);
      await relevantSpace.public.set('name', profile.name);
      await relevantSpace.private.set('email', profile.email);
      await box.syncDone;
      const relevantProfile = await Box.getSpace(address, 'relevant');
      const email = await relevantSpace.private.get('email');
      const all = await relevantSpace.public.all();
      console.log('all', all);
      console.log('relevantProfile', relevantProfile, email);
    },
    [address]
  );
}

async function signClaim(user, address) {
  const { DID } = user;
  const expiresIn = 10 * 60;
  const signature = await user.signClaim({ DID, address }, { expiresIn });
  return { signature, address, DID };
}

function getMnemonic() {
  const mnemonic = local.getItem('3box_mnemonic');
  if (mnemonic) return mnemonic;
  const wallet = Wallet.createRandom();
  local.setItem('3box_mnemonic', wallet.mnemonic);
  return wallet.mnemonic;
}
