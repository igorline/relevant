import { useEffect, useCallback } from 'react';
import { alert } from 'utils';
import { providers, utils } from 'ethers';
import { getProfile } from '3box/lib/api';
import { signMessage } from 'utils/eth';
import { useWeb3, useMetamask } from 'modules/contract/contract.hooks';
import { useDispatch } from 'react-redux';
import { loginWithBox } from 'modules/auth/auth.actions';
// import { local } from 'utils/storage';

const Alert = alert.Alert();
export function use3BoxProfile({ address, metamask, setProfile }) {
  return useEffect(() => {
    if (!address || !metamask) return;
    const init3Box = async () => {
      try {
        const boxProfile = await getProfile(address);

        setProfile([null, { ...boxProfile }]);

        const provider = new providers.Web3Provider(metamask);
        const { msg, signature } = await signMessage(provider, address);

        return setProfile([null, { ...boxProfile, signature, msg }]);
      } catch (err) {
        Alert.alert(err.message);
        return setProfile([err.message]);
      }
    };
    init3Box();
  }, [address]); // eslint-disable-line
}

export function useLoginWithBox(close) {
  const [accounts] = useWeb3();
  const metamask = useMetamask();
  const address = accounts && accounts[0] && utils.getAddress(accounts[0]);
  const dispatch = useDispatch();
  const logIn = useCallback(async () => {
    if (!metamask || !address) return Alert.alert('Pleas enable Metamask to log in.');

    const provider = new providers.Web3Provider(metamask);
    const { signature, msg } = await signMessage(provider, address);
    const success = await dispatch(loginWithBox({ signature, address, msg }));
    success && close && close();
    return success;
  }, [address, metamask, dispatch, close]);
  return logIn;
}

// We are going to use this for a desktop-mobile sync
// function getMnemonic() {
//   const mnemonic = local.getItem('3box_mnemonic');
//   if (mnemonic) return mnemonic;
//   const wallet = Wallet.createRandom();
//   local.setItem('3box_mnemonic', wallet.mnemonic);
//   return wallet.mnemonic;
// }
