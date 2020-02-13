import { useEffect, useCallback } from 'react';
import { useWeb3, useMetamask } from 'modules/contract/contract.hooks';
import { useDispatch } from 'react-redux';
import Box from '3box';
import { alert } from 'utils';
import { ethers, utils } from 'ethers';
import { loginWithBox } from './auth.actions';

const Alert = alert.Alert();
export function use3BoxProfile({ address, metamask, setProfile }) {
  return useEffect(() => {
    if (!address || !metamask) return;
    const init3Box = async () => {
      try {
        const box = await Box.openBox(address, metamask);

        const relevantProfile = await Box.getSpace(address, 'relevant');
        if (relevantProfile.defaultProfile === 'relevant')
          return setProfile([null, relevantProfile]);

        const relevantSpace = await box.openSpace('relevant');
        await Promise.all([box.syncDone]);

        const boxProfile = await Box.getProfile(address);
        relevantSpace.public.set('defaultProfile', '3box');

        const emailObj = await box.verified.email();
        const email = emailObj && emailObj.email_address;

        const { DID } = relevantSpace.user;
        const expiresIn = 10 * 60;
        const signature = await relevantSpace.user.signClaim(
          { DID, address },
          { expiresIn }
        );
        return setProfile([null, { ...boxProfile, email, signature, DID }]);
      } catch (err) {
        Alert.alert(err.message);
        return setProfile([err.message]);
      }
    };
    init3Box();
  }, [address]); // eslint-disable-line
}

export function useUpdateProfile() {
  const [accounts] = useWeb3();
  const metamask = useMetamask();
  const address = accounts && utils.getAddress(accounts[0]);
  return useCallback(
    async profile => {
      const box = await Box.openBox(address, metamask);
      await box.syncDone;
      const relevantSpace = await box.openSpace('relevant');
      await relevantSpace.syncDone;
      const imageObject = [
        {
          '@type': 'ImageObject',
          contentUrl: profile.image
        }
      ];

      // for some reason this doesn't work?
      relevantSpace.public.set('defaultProfile', 'relevant');
      relevantSpace.public.set('image', imageObject);
      relevantSpace.public.set('username', profile.name);
      relevantSpace.private.set('email', profile.email);
    },
    [address, metamask]
  );
}

export function useLoginWithBox(close) {
  const [accounts] = useWeb3();
  const metamask = useMetamask();
  const address = accounts && utils.getAddress(accounts[0]);
  const dispatch = useDispatch();
  return useCallback(async () => {
    if (!metamask) return Alert.alert('Pleas enable Metamask to log in.');

    const provider = new ethers.providers.Web3Provider(metamask);
    const signer = provider.getSigner();

    const now = new Date();
    const exp = Math.floor(now.setMinutes(now.getMinutes() + 5) / 1000);
    const msg = {
      address,
      exp
    };
    const signature = await signer.signMessage(JSON.stringify(msg));
    const success = await dispatch(loginWithBox({ signature, address, msg }));
    return success && close && close();
  }, [address, metamask, dispatch, close]);
}
