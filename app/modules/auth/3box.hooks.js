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

        const relevantProfile = await box.openSpace('relevant');
        await Promise.all([box.syncDone]);

        if (relevantProfile.defaultProfile === 'relevant')
          return setProfile([null, relevantProfile]);

        const boxProfile = await Box.getProfile(address);
        relevantProfile.public.set('defaultProfile', '3box');

        const emailObj = await box.verified.email();
        const email = emailObj && emailObj.email_address;

        const { DID } = relevantProfile.user;
        const expiresIn = 10 * 60;
        const signature = await relevantProfile.user.signClaim(
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

export function useUpdateProfile(address, metamask) {
  return useCallback(
    () => async profile => {
      const box = await Box.openBox(address, metamask);
      await box.syncDone;
      const relevantProfile = await box.openSpace('relevant');
      await relevantProfile.syncDone;
      const imageObject = [
        {
          '@type': 'ImageObject',
          contentUrl: profile.image
        }
      ];
      relevantProfile.public.set('image', imageObject);
      relevantProfile.public.set('username', profile.username);
      relevantProfile.private.set('email', profile.email);
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
