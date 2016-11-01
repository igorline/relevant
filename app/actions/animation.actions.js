import * as types from './actionTypes';

require('../publicenv');

let apiServer = process.env.API_SERVER + '/api/';

export function setAnimation(type) {
  return {
    type: types.SET_ANIMATION,
    payload: {
      type
    }
  };
}

export function triggerAnimation(type) {
  return (dispatch) => {
    dispatch(setAnimation(type));
    setTimeout(() => {
      dispatch(clearAnimation());
    }, 500);
  };
}

export function stopAnimation() {
  return {
    type: 'STOP_ANIMATION',
  };
}

export function clearAnimation() {
  return {
    type: types.CLEAR_ANIMATION,
  };
}
