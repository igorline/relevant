import { useState, useEffect } from 'react';
import { CASHOUT_LIMIT } from 'server/config/globalConstants';
import * as warnings from './web3Warning.constants';
import {
  hasAccount,
  hasAccountConnected,
  hasCorrectAccount,
  hasCorrectNetwork
} from './web3Warning.selectors';

export const useCurrentWarning = (accounts, user, networkId) => {
  const [warning, setWarning] = useState();

  useEffect(() => {
    const updateWarnings = () => {
      const canClaim = user.balance - (user.airdroppedTokens || 0);
      if (canClaim < CASHOUT_LIMIT) return warnings.balance;
      if (!hasAccount(accounts)) return warnings.metamask;
      if (!hasCorrectNetwork(networkId)) return warnings.network;
      if (!hasAccountConnected(user)) return warnings.connection;
      if (!hasCorrectAccount(user, accounts)) return warnings.account(user.ethAddress[0]);

      return null;
    };
    setWarning(updateWarnings());
  }, [accounts, user.ethAddress, networkId, user]);
  return warning;
};
