import * as types from './actionTypes';
require('../publicenv');
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');
import * as utils from '../utils';
var apiServer = process.env.API_SERVER+'/api/'


export function setNotif(active, text, bool) {
    return {
        type: types.SET_NOTIF,
        payload: {
          active: active,
          text: text,
          bool: bool
        }
    };
}

export
function getActivity(userId) {
  return fetch(process.env.API_SERVER+'/api/notification?forUser='+userId, {
    credentials: 'include',
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
  })
  .then((response) => response.json())
  .then((responseJSON) => {
    return {'status': true, 'data': responseJSON}
  })
  .catch((error) => {
    return {'status': false, 'data': error};
  });
}

export
function createNotification(token, obj) {
  return fetch(process.env.API_SERVER+'/api/notification/create?access_token='+token, {
    credentials: 'include',
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(obj)
  })
  .then((response) => response.json())
  .then((responseJSON) => {
    return {'status': true, 'data': responseJSON}
  })
  .catch((error) => {
    return {'status': false, 'data': error};
  });
}







