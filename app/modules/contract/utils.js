import pickBy from 'lodash.pickby';
import { types } from 'core/contracts';
import { getProvider, getBN } from 'modules/web_ethTools/utils';

export function parseBN(value, web3Instance = getProvider()) {
  return value && value.get ? getBN(value.get('_hex'), web3Instance) : value;
}

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
      method !== 'nonceOf' &&
      method !== 'isOwner' &&
      method !== 'roundDecay'
  )
);
