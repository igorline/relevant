import * as types from './actionTypes';
require('../publicenv');
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');
import * as utils from '../utils';

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
    .then(utils.fetchError.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
        //console.log(responseJSON, 'response');
        dispatch(setSelectedUser(responseJSON));
        dispatch(getSelectedUserPosts(responseJSON._id));
        dispatch(Actions.User);
    })
    .catch((error) => {
        console.log(error, 'error');
    });
  }
}

export
function getPostUser(userId, token) {
  return function(dispatch) {
    return fetch('http://'+process.env.SERVER_IP+':3000/api/user/'+userId+'?access_token='+token, {
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
        //console.log(responseJSON, 'postUser');
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

export
function getSelectedUserPosts(userId) {
  return function(dispatch) {
    fetch('http://'+process.env.SERVER_IP+':3000/api/post/', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({'search': {'user': userId}})
    })
    .then(utils.fetchError.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      //console.log(responseJSON, 'json response getSelectedUserPosts')
      dispatch(setSelectedUserPosts(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export
function setSelectedUserPosts(posts) {
    return {
        type: types.SET_SELECTED_USER_POSTS,
        payload: posts
    };
}
