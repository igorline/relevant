import * as types from './actionTypes';
require('../publicenv');
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');
import * as utils from '../utils';
var apiServer = process.env.API_SERVER+'/api/'

export function setMessages(messages) {
    return {
        type: types.SET_MESSAGES,
        payload: messages
    };
}

export function setMessagesCount(number) {
    return {
        type: 'SET_MESSAGES_COUNT',
        payload: number
    };
}

export
function getMessages(userId) {
   return function(dispatch) {
    fetch(process.env.API_SERVER+'/api/message?to='+userId, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setMessages(responseJSON));
    })
    .catch((error) => {
       console.log(error, 'error');
    });
  }
}

export
function createMessage(token, obj) {
  return function(dispatch) {
    return fetch(process.env.API_SERVER+'/api/message?access_token='+token, {
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
}







