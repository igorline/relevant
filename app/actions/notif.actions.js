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

export function setGeneralActivity(data) {
    return {
        type: types.SET_GENERAL_ACTIVITY,
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
function getActivity(userId, skip) {
  if (!skip) skip = 0;
  return function(dispatch) {
    fetch(process.env.API_SERVER+'/api/notification?userId='+userId+'&skip='+skip, {
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
    })
    .catch((error) => {
      console.log('error', error)
    });
  }
}

export
function getGeneralActivity(userId, skip) {
  return function(dispatch) {
    fetch(process.env.API_SERVER+'/api/notification/general?skip='+skip+'&avoidUser='+userId, {
      credentials: 'include',
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setGeneralActivity(responseJSON));
    })
    .catch((error) => {
      console.log('error', error)
    });
  }
}

export
function markRead(token, userId) {
  return function(dispatch) {
    console.log('mark read')
    fetch(process.env.API_SERVER+'/api/notification?access_token='+token+'&forUser='+userId, {
      credentials: 'include',
      method: 'PUT',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(getActivity(userId));
    })
    .catch((error) => {
      console.log('error', error)
    });
  }
}

export
function createNotification(token, obj) {
  return function(dispatch) {
    fetch(process.env.API_SERVER+'/api/notification?access_token='+token, {
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
      console.log('created notif')
    })
    .catch((error) => {
      console.log(error, 'error creating notif')
    });
  }
}







