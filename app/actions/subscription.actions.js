import * as types from './actionTypes';
require('../publicenv');
var { Actions } = require('react-native-redux-router');
import * as utils from '../utils';

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
