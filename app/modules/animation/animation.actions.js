import * as types from 'core/actionTypes';

export function triggerAnimation(type, data) {
  return {
    type: types.SET_ANIMATION,
    payload: {
      type,
      data
    }
  };
}
