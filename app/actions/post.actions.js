import * as types from './actionTypes';
require('../publicenv');
var { Actions } = require('react-native-redux-router');
import * as utils from '../utils';

var apiServer = process.env.API_SERVER+'/api/'

export function getFeed(token, skip, tag) {
  var url = process.env.API_SERVER+'/api/feed?access_token='+token+'&skip='+skip;
  if (tag) url = process.env.API_SERVER+'/api/feed?access_token='+token+'&skip='+skip+'&tag='+tag._id;
  return function(dispatch) {
    fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'GET',
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setFeed(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export
function setFeed(feed) {
    return {
        type: types.SET_FEED,
        payload: feed
    };
}

export
function clearPosts() {
    return {
        type: types.CLEAR_POSTS
    };
}

export function getPosts(skip, tag) {
  var url = process.env.API_SERVER+'/api/post?skip='+skip;
  if (tag) url = process.env.API_SERVER+'/api/post?skip='+skip+'&tag='+tag._id;
  return function(dispatch) {
    fetch(url, {
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
      //console.log('get posts response', responseJSON);
      dispatch(setPosts(responseJSON));
    })
    .catch((error) => {
        console.log(error, 'error');
    });
  }
}

export function getPostsByRank(skip, tag) {
  var url = process.env.API_SERVER+'/api/post/rank?skip='+skip;
  if (tag) url = process.env.API_SERVER+'/api/post/rank?skip='+skip+'&tag='+tag._id;
  return function(dispatch) {
    fetch(url, {
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
      //console.log('get posts response', responseJSON);
      dispatch(setPosts(responseJSON));
    })
    .catch((error) => {
        console.log(error, 'error');
    });
  }
}

export function setPosts(data) {
    return {
        type: types.SET_POSTS,
        payload: data
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

export function submitPost(post, token) {
  console.log(post, 'submitPost init');
    return fetch(process.env.API_SERVER+'/api/post?access_token='+token, {
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
        return true;
      } else {
        return false;
      }
    })
    .catch((error) => {
      return false;
    });
}

export function dispatchPost(post, token) {
   return function(dispatch) {
    return fetch(process.env.API_SERVER+'/api/post?access_token='+token, {
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
        return true;
      } else {
        return false;
      }
    })
    .catch((error) => {
      return false;
    });
   }
}

export function postError() {
  return {
    type: types.POST_ERROR,
  };
}

export function getActivePost(postId) {
  return function(dispatch) {
    fetch(process.env.API_SERVER+'/api/post?_id='+postId, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'GET',
    })
    .then(utils.fetchError.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setActivePost(responseJSON[0]));
      //dispatch(Actions.SinglePost);
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export function getComments(postId) {
  return function(dispatch) {
    fetch(process.env.API_SERVER+'/api/comment?post='+postId, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'GET',
    })
    .then(utils.fetchError.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setComments(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export function createComment(token, commentObj) {
  return function(dispatch) {
    console.log('sending comment')
    fetch(process.env.API_SERVER+'/api/comment?access_token='+token, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(commentObj)
    })
    .then(utils.fetchError.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      // dispatch(setComments(responseJSON));
      console.log(responseJSON, 'created comment');
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export function invest(token, amount, post, investingUser){
  return dispatch => {
    return fetch( apiServer + 'invest/create?access_token='+token, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        investor: investingUser._id,
        amount: amount,
        post: post
      })
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch({type: 'server/notification', payload: {user: post.user._id, message: investingUser.name+' just invested in your post'}});
      return true;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
  }
}

export function createSubscription(token, post) {
  return dispatch => {
    fetch( apiServer + 'subscription/create?access_token='+token, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        following: post.user._id
      })
    })
    .then((response) => response.json())
    .then((responseJSON) => {
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

export function setComments(comments) {
    return {
        type: types.SET_COMMENTS,
        payload: comments
    };
}






