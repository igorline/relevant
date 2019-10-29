import { NETWORK_NUMBER } from 'core/config';

export const hasAccount = accounts => accounts && accounts[0];

export const hasAccountConnected = user => user.ethAddress && user.ethAddress[0];

export const hasCorrectNetwork = networkId => networkId && networkId === NETWORK_NUMBER;

export const hasCorrectAccount = (user, accounts) =>
  user.ethAddress[0].toLowerCase() === accounts[0].toLowerCase();

export const hasWarning = (stack, _id) => stack.find(({ id }) => id === _id);
