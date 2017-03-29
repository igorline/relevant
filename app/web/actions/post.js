export const SET_SELECTED_POST = 'SET_SELECTED_POST';

import { push } from 'react-router-redux';

var request = require('superagent');

export function getSelectedPost(postID) {
  return function(dispatch) {
    request
      .get('/api/post/' + postID)
      .end(function(error, response) {
        if (error || !response.ok) {
          console.log(error, 'error');
        } else if (response.body === null) {
          dispatch(setSelectedPost('notFound'));
        } else {
          dispatch(setSelectedPost(response.body));
        }
      })
  }
}

export function deletePost(token, postID) {
  if(!token) token = utils.auth.getToken();
  console.log('deleting post');
  return function(dispatch) {
    request
      .delete('/api/post/' + postID +'?access_token='+token)
      .end(function(error, response) {
        if (error || !response.ok) {
          console.log(error, 'error');
        } else {
          dispatch(push('/home'));
        }
      })
  }
}

function setSelectedPost(post) {
  return {
    type: "SET_SELECTED_POST",
    payload: post
  };
}
