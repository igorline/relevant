import * as types from './actionTypes';
require('../publicenv');
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');
import * as utils from '../utils';
var apiServer = 'http://'+process.env.SERVER_IP+':3000/api/'


export function setNotif(active, text, bool) {
    setTimeout(function() { reset() }, 3000);
    return {
        type: types.SET_NOTIF,
        payload: {
          active: active,
          text: text,
          bool: bool
        }
    };
}

export function reset() {
  console.log('reset')
  return {
    type: types.SET_NOTIF,
    payload: {
      active: false,
      text: null,
      bool: false
    }
  }
}






