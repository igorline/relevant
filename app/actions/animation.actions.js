import * as types from './actionTypes';
require('../publicenv');
var { Actions } = require('react-native-redux-router');
import * as utils from '../utils';

var apiServer = process.env.API_SERVER+'/api/'

export function setAnimation(type) {
    return {
        type: types.SET_ANIMATION,
        payload: {
          type: type
        }
    };
}

export function triggerAnimation(type) {
  return dispatch => {
    dispatch(setAnimation(type));
    setTimeout(function() {
      dispatch(clearAnimation());
    }, 500);
  }
}

export function clearAnimation() {
    return {
        type: types.CLEAR_ANIMATION,
    };
}