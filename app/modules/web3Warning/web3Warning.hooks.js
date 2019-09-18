import { useState, useEffect } from 'react';
import { CASHOUT_LIMIT } from 'server/config/globalConstants';
import * as warnings from './web3Warning.constants';
import {
  hasAccount,
  hasAccountConnected,
  hasCorrectAccount,
  hasCorrectNetwork
} from './web3Warning.selectors';

export const useCurrentWarning = ({
  accounts,
  user,
  networkId,
  unclaimedSig,
  canClaim
}) => {
  const [warning, setWarning] = useState();

  useEffect(() => {
    const updateWarnings = () => {
      if (canClaim < CASHOUT_LIMIT && !unclaimedSig) return warnings.balance;
      if (!hasAccount(accounts)) return warnings.metamask;
      if (!hasCorrectNetwork(networkId)) return warnings.network;
      if (!hasAccountConnected(user)) return warnings.connection;
      if (!hasCorrectAccount(user, accounts)) return warnings.account(user.ethAddress[0]);

      return null;
    };
    setWarning(updateWarnings());
  }, [accounts, user.ethAddress, networkId, user, canClaim, unclaimedSig]);
  return warning;
};
