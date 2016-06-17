import * as types from './actionTypes';
require('../publicenv');
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');
import * as utils from '../utils';

export
function getSelectedUser(userId) {
  return function(dispatch) {
    fetch(process.env.API_SERVER+'/api/user/'+userId, {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
      }
    })
    .then(utils.fetchError.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
        dispatch(setSelectedUser(responseJSON));
        dispatch(Actions.User);
    })
    .catch((error) => {
        console.log(error, 'error');
    });
  }
}

export
function getOnlineUser(userId, token) {
  return function(dispatch) {
    return fetch(process.env.API_SERVER+'/api/user/'+userId+'?access_token='+token, {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      return {status: true, data: responseJSON};
    })
    .catch((error) => {
        console.log(error, 'error');
        return {status: false, data: error};
    });
  }
}

export
function getPostUser(userId, token) {
  return function(dispatch) {
    return fetch(process.env.API_SERVER+'/api/user/'+userId+'?access_token='+token, {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
      }
    })
    .then(utils.fetchError.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
        return responseJSON;
    })
    .catch((error) => {
        console.log(error, 'error');
    });
  }
}

export
function setSelectedUser(user) {
    return {
        type: types.SET_SELECTED_USER,
        payload: user
    };
}
