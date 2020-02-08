import { useEffect, useCallback } from 'react';
import Box from '3box';
import { alert } from 'utils';

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
