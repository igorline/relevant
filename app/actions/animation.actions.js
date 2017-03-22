import * as types from './actionTypes';

export function triggerAnimation(type, amount) {
  return {
    type: types.SET_ANIMATION,
    payload: {
      type,
      amount: amount || 1
    }
  };
}

