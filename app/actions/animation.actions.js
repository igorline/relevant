import * as types from './actionTypes';

export function triggerAnimation(type, params) {
  return {
    type: types.SET_ANIMATION,
    payload: {
      type,
      amount: params && params.amount ? params.amount : 1,
      parent: params && params.parent ? params.parent : null
    }
  };
}
