export const SET_SELECTED_USER  = 'SET_SELECTED_USER';
export const SET_USERS_POSTS = 'SET_USERS_POSTS';

var request = require('superagent');

export function getSelectedUser(userID) {
  return function(dispatch) {
    request
    .get('/api/user/'+userID)
    .end(function(error, response){
      if (error || !response.ok) {
        console.log(error, 'error');
      } else if (response.body === 401) {
        dispatch(setSelectedUser(null));
      } else {
        dispatch(setSelectedUser(response.body));
      }
    })
  }
}

export function getUsersPosts(userID) {
  return function(dispatch) {
    request
    .get('/api/post/user/'+userID)
    .end(function(error, response){
      if (error || !response.ok) {
        console.log(error, 'error');
      } else {
        dispatch(setUsersPosts(response.body));
      }
    })
  }
}

function setSelectedUser(user) {
  return {
      type: "SET_SELECTED_USER",
      payload: user
  };
}

function setUsersPosts(posts) {
  return {
      type: "SET_USERS_POSTS",
      payload: posts
  };
}

export function handleErrors(response) {
  if (!response.ok) {
      console.log(response, 'error response')
      throw Error(response.statusText);
      return false;
  }
  return response;
}
