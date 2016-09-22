import * as types from './actionTypes';
require('../publicenv');
var { Actions } = require('react-native-redux-router');
import * as utils from '../utils';
var apiServer = process.env.API_SERVER+'/api/'

export
function getSubscriptionData(type, userId) {
    return fetch(process.env.API_SERVER+'/api/subscription/search?'+type+'='+userId, {
      credentials: 'include',
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      return {'type': type, 'data': responseJSON}
    })
    .catch((error) => {
      return {'type': 'error', 'data': error};
    });
}

export function createSubscription(token, post) {
  return dispatch => {
    fetch( apiServer + 'subscription?access_token='+token, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    })
    .then((response) => response.json())
    .then((responseJSON) => {
    })
    .catch((error) => {
      console.log(error);
    });
  }
}
