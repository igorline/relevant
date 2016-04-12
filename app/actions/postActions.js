import * as types from './actionTypes';
require('../publicenv');
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');

var apiServer = 'http://'+process.env.SERVER_IP+':3000/api/'

function handleErrors(response) {
    if (!response.ok) {
      console.log(response)
      throw Error(response.statusText);
    }
    return response;
}

export function getPosts() {
  return function(dispatch) {
    fetch('http://'+process.env.SERVER_IP+':3000/api/post/', {
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
        dispatch(setPosts(responseJSON));
    })
    .catch((error) => {
        console.log(error, 'error');
    });
  }
}

export function setPosts(posts) {
    return {
        type: types.SET_POSTS,
        payload: posts
    };
}

export function setRecentPosts(posts) {
    return {
        type: types.SET_RECENT_POSTS,
        payload: posts
    };
}

export function updatePost(post) {
  return {
    type: types.UPDATE_POST,
    payload: post
  }
}

export function getUserPosts(userId) {
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
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setUserPosts(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export function setUserPosts(posts) {
    return {
        type: types.SET_USER_POSTS,
        payload: posts
    };
}

export function submitPost(post) {
  return function(dispatch) {
    fetch('http://'+process.env.SERVER_IP+':3000/api/post/create', {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    })
    .then((response) => {
      console.log(response, 'submitPost response');
      if (response.status == 200) {
        dispatch(Actions.Read);
      } else {
        dispatch(postError(response.status));
      }
    })
    .catch((error) => {
        console.log(error, 'error');
        dispatch(postError(error));
    });
  }
}

export function postError() {
  return {
    type: types.POST_ERROR,
  };
}

export function getActivePost(postId) {
  console.log(postId, 'postId')
  return function(dispatch) {
    fetch('http://'+process.env.SERVER_IP+':3000/api/post', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({'search': {'_id': postId}})
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      console.log(responseJSON, 'activePost');
      dispatch(setActivePost(responseJSON[0]));
      dispatch(Actions.SinglePost);
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export function invest(token, invest){
  console.log("INVESTING", invest)
  return dispatch => {
    fetch( apiServer + 'post/' + invest.postId + '/invest', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invest)
    })
    .then(handleErrors)
    .then((response) => response.json())
    .then((post) => {
      console.log(post)
      dispatch(updatePost(post))
    })
    .catch((error) => {
      console.log(error);
    });
  }
}

export function setActivePost(post) {
    return {
        type: types.SET_ACTIVE_POST,
        payload: post
    };
}






