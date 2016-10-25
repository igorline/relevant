import * as types from './actionTypes';
require('../publicenv');
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');
import * as utils from '../utils';

export
function getSelectedUser(userId) {
  return function(dispatch) {
    console.log('get', userId);
    return fetch(process.env.API_SERVER+'/api/user/'+userId, {
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
        dispatch(setSelectedUserData(responseJSON));
        return true;
    })
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
    // .catch((error) => {
    //     console.log(error, 'error');
    //     return {status: false, data: error};
    // });
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
    // .catch((error) => {
    //     console.log(error, 'error');
    // });
  }
}

export function getUsers(skip, limit, id) {
console.log('getUsers', skip, limit, id)
  let tagsString = '';
  if (!skip) skip = 0;
  if (!limit) limit = 10;
  let url = process.env.API_SERVER + '/api/user/list/' + id + '?skip=' + skip + '&limit=' + limit;
  return function(dispatch) {
    dispatch(getUsersLoading());
    fetch(url, {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then((response) => {
      return response.json();
    })
    .then((responseJSON) => {
      dispatch(setUserList(responseJSON));
    })
    .catch((error) => {
        console.log(error, 'error');
    });
  }
}

export
function getUsersLoading() {
    return {
        type: 'GET_USER_LIST'
    };
}

export
function setUserList(users) {
    return {
        type: 'SET_USER_LIST',
        payload: users
    };
}

export
function clearUserList() {
    return {
        type: 'CLEAR_USER_LIST'
    };
}

export
function setSelectedUser(user) {
    var set = user ? user : null;
    return {
        type: types.SET_SELECTED_USER,
        payload: set
    };
}

export
function clearSelectedUser() {
    return {
        type: 'CLEAR_SELECTED_USER',
    };
}

export
function setSelectedUserData(data) {
    return {
        type: 'SET_SELECTED_USER_DATA',
        payload: data
    };
}
