import * as types from './actionTypes';

require('../publicenv');

export function triggerAnimation(type, amount) {
  return {
    type: types.SET_ANIMATION,
    payload: {
      type,
      amount: amount || 1
    }
  };
}

// export function triggerAnimation(type) {
//   return (dispatch) => {
//     dispatch(setAnimation(type));
//   };
// }

