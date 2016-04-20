import * as types from './actionTypes';
require('../publicenv');
var { Actions } = require('react-native-redux-router');
import * as utils from '../utils';

export
function getSubscriptionData(type, userId) {
  var searchObj = {'search':{}};
  searchObj.search[type] = userId;
    return fetch('http://'+process.env.SERVER_IP+':3000/api/subscription', {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchObj)
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      return {'type': type, 'data': responseJSON}
    })
    .catch((error) => {
      return {'type': 'error', 'data': error};
    });
}
