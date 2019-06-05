import pickBy from 'lodash.pickby';
import { getProvider, getBN } from 'modules/web_ethTools/utils';
import { types } from 'core/contracts';

export const parseBN = (value, web3Instance = getProvider()) =>
  value && value.get ? getBN(value.get('_hex'), web3Instance).toString() : value;

// TODO -- provide better method sorting from statesauce
export const readableMethods = Object.keys(
  pickBy(
    types.methods,
    (_, method) =>
      !types.methods[method].send &&
      method !== 'balanceOf' &&
      method !== 'isMinter' &&
      method !== 'allowance' &&
      method !== 'partialSum' &&
      method !== 'nonceOf'
  )
);
