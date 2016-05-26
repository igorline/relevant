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

export function setActivity(data) {
    return {
        type: types.SET_ACTIVITY,
        payload: data
    };
}

export function setCount(data) {
    return {
        type: types.SET_COUNT,
        payload: data
    };
}


export
function getActivity(userId) {
   return function(dispatch) {
  fetch(process.env.API_SERVER+'/api/notification?forUser='+userId, {
    credentials: 'include',
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
  })
  .then((response) => response.json())
  .then((responseJSON) => {
    dispatch(setActivity(responseJSON));
    dispatch(countUnread(responseJSON));
  })
  .catch((error) => {
    console.log('error', error)
  });
}
}

function countUnread(data) {
  return function(dispatch) {
  var num = 0;
  data.forEach(function(activity) {
    if (!activity.read) num += 1;
  })
  if (num > 0) {
    dispatch(setCount(num));
  }
}
}

export
function createNotification(token, obj) {
  return fetch(process.env.API_SERVER+'/api/notification?access_token='+token, {
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







