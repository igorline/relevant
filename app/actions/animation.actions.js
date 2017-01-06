import * as types from './actionTypes';

require('../publicenv');

export function triggerAnimation(type) {
  return {
    type: types.SET_ANIMATION,
    payload: {
      type
    }
  };
}

// export function triggerAnimation(type) {
//   return (dispatch) => {
//     dispatch(setAnimation(type));
//   };
// }

