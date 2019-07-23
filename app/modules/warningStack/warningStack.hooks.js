import { useState, useEffect } from 'react';
import filter from 'lodash.filter';
import sortBy from 'lodash.sortby';
import * as warnings from './warningStack.constants';
import {
  hasAccount,
  hasAccountConnected,
  hasCorrectAccount,
  hasCorrectNetwork,
  hasWarning
} from './warningStack.selectors';

export const useWarningStack = (accounts, user, networkId) => {
  const [warningStack, setWarnings] = useState([]);
  const addWarning = warning => {
    if (!hasWarning(warningStack, warning.id)) {
      setWarnings([...warningStack, warning]);
    }
  };
  const removeWarning = ({ id: _id }) => {
    if (warningStack.length && hasWarning(warningStack, _id)) {
      setWarnings(filter(warningStack, ({ id }) => id !== _id));
    }
  };
  useEffect(() => {
    if (!hasAccount(accounts)) {
      addWarning(warnings.metamask);
    } else {
      if (!hasAccountConnected(user)) {
        addWarning(warnings.connection);
      } else {
        if (!hasCorrectAccount(user, accounts)) {
          addWarning(warnings.account(user.ethAddress[0]));
        } else {
          removeWarning(warnings.account());
        }
        removeWarning(warnings.connection);
      }
      removeWarning(warnings.metamask);
    }

    if (!hasCorrectNetwork(networkId)) {
      addWarning(warnings.network);
    } else {
      removeWarning(warnings.network);
    }
  }, [accounts, user.ethAddress, networkId]);

  return sortBy(warningStack, ['id']);
};
