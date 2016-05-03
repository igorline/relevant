import * as types from './actionTypes';
require('../publicenv');
var { Actions } = require('react-native-redux-router');
import * as utils from '../utils';

export
function userToSocket(user) {
  return dispatch => {
    dispatch({type:'server/storeUser', payload: user})
  }
}
