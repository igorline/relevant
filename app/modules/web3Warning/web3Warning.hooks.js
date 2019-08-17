import { useState, useEffect } from 'react';
// import sortBy from 'lodash/sortBy';
import * as warnings from './web3Warning.constants';
import {
  hasAccount,
  hasAccountConnected,
  hasCorrectAccount,
  hasCorrectNetwork
  // hasWarning
} from './web3Warning.selectors';

export const useCurrentWarning = (accounts, user, networkId) => {
  const [warning, setWarning] = useState([]);

  useEffect(() => {
    const updateWarnings = () => {
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

// export const useWarningStack = (accounts, user, networkId) => {
//   const [warningStack, setWarnings] = useState([]);

//   useEffect(() => {
//     const addWarning = warning => {
//       setWarnings(w => {
//         if (hasWarning(w, warning.id)) return w;
//         return [...w, warning];
//       });
//     };
//     const removeWarning = ({ id: _id }) =>
//       setWarnings(w => w.filter(({ id }) => id !== _id));

//     const updateWarnings = () => {
//       !hasCorrectNetwork(networkId)
//         ? addWarning(warnings.network)
//         : removeWarning(warnings.network);

//       if (!hasAccount(accounts)) return addWarning(warnings.metamask);
//       removeWarning(warnings.metamask);

//       if (!hasAccountConnected(user)) return addWarning(warnings.connection);
//       removeWarning(warnings.connection);

//       if (!hasCorrectAccount(user, accounts))
//         return addWarning(warnings.account(user.ethAddress[0]));
//       return removeWarning(warnings.account());
//     };
//     updateWarnings();
//   }, [accounts, user.ethAddress, networkId, user, warningStack]);

//   return sortBy(warningStack, ['id']);
// };
