import * as types from './actionTypes';
require('../publicenv');
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');

export
function getSelectedUser(userId, token) {
  return function(dispatch) {
    fetch('http://'+process.env.SERVER_IP+':3000/api/user/'+userId+'?access_token='+token, {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((responseJSON) => {
        console.log(responseJSON, 'response');
        dispatch(setSelectedUser(responseJSON));
        dispatch(Actions.User);
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