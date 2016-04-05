import * as types from './actionTypes';
require('../publicenv');
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');

export
function getPosts() {
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

export
function setPosts(posts) {
    return {
        type: types.SET_POSTS,
        payload: posts
    };
}

export
function getUserPosts(userId) {
  return function(dispatch) {
    fetch('http://'+process.env.SERVER_IP+':3000/api/post/', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({'search': {'userId': userId}})
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      console.log(responseJSON, 'userPosts');
      dispatch(setUserPosts(responseJSON));
      // self.setState({userPosts: responseJSON});
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export
function setUserPosts(posts) {
    return {
        type: types.SET_USER_POSTS,
        payload: posts
    };
}

export function submitPost(userId, postText) {
  console.log(userId, postText);
  return function(dispatch) {
    fetch('http://'+process.env.SERVER_IP+':3000/api/post/create', {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          userId: userId,
          body: postText
      })
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

export function setActivePost(post) {
    return {
        type: types.SET_ACTIVE_POST,
        payload: post
    };
}





