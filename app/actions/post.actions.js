import * as types from './actionTypes';
require('../publicenv');
// var { Actions } = require('react-native-redux-router');
import * as utils from '../utils';
import * as authActions from './auth.actions';

var apiServer = process.env.API_SERVER+'/api/'
//load 5 posts at a time
const limit = 5;

export function getFeed(token, skip, tag) {
  var url = process.env.API_SERVER+'/api/feed?access_token='+token+'&skip='+skip+'&limit='+limit;
  if (tag) url = process.env.API_SERVER+'/api/feed?access_token='+token+'&skip='+skip+'&tag='+tag._id+'&limit='+limit;
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
      console.log(responseJSON, 'setting feed');
      dispatch(setPosts(responseJSON, 'feed'));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export function deletePost(token, post) {
  var url = process.env.API_SERVER+'/api/post/'+post._id+'?access_token='+token;
  return function(dispatch) {
    fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
    })
    .then((response) => {
      console.log(response, 'delete response')
      dispatch(removePostFromIndex(post));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export function clearPosts(type) {
    return {
        type: types.CLEAR_POSTS,
        payload: {
          type: type
        }
    };
}

export function refreshPosts(type) {
    return {
        type: types.REFRESH_POSTS,
        payload: {
          type: type
        }
    };
}

export function setPostCategory(tag) {
    var set = tag ? tag : null;
    return {
        type: 'SET_POST_CATEGORY',
        payload: set
    };
}

export function getPostsAction() {
  return {
      type: 'GET_POSTS',
      payload: null
  };
}

export function getPosts(skip, tags, sort, limit) {
  //console.log(skip, tags, sort);
  var tagsString = '';
  if (!skip) skip = 0;
  if (!limit) limit = 5;
  if (!sort) sort = null;

  //change this if we want to store top and new in separate places
  var type = 'index';

  var url = process.env.API_SERVER+'/api/post?skip='+skip+'&sort='+sort+'&limit='+limit;

  if (tags) {
    if (tags.length) {
      tags.forEach(function(tag, i) {
        console.log(tag._id)
        if (tag._id) {
          if (i == tags.length - 1) {
            tagsString+=tag._id;
          } else {
            var alter = tag._id;
            tagsString+=alter+=',';
          }
        }
      })
    } else {
      tagsString = tags._id;
    }
    url = process.env.API_SERVER+'/api/post?skip='+skip+'&tag='+tagsString+'&sort='+sort+'&limit='+limit;
  }

  return function(dispatch) {

    //sets 'loading' state to true
    dispatch(getPostsAction());

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
      dispatch(setPosts(responseJSON, type));
    })
    .catch((error) => {
        console.log(error, 'error');
    });
  }
}

export function setPosts(data, type) {
    return {
        type: types.SET_POSTS,
        payload: {
          data: data,
          type: type
        }
    };
}


export function getUserPosts(skip, limit, userId) {
  var tagsString = '';
  if (!skip) skip = 0;
  if (!limit) limit = 5;

  var url = process.env.API_SERVER+'/api/post/user/'+userId+'?skip='+skip+'&limit='+limit;

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
      dispatch(setUserPosts(responseJSON, 'user', userId));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export function setUserPosts(posts, user, userId) {
    return {
        type: 'SET_POSTS',
        payload: {
          userId: userId,
          data: posts,
          type: user
        }
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

export function removePostFromIndex(post) {
  return {
    type: types.REMOVE_POST,
    payload: post
  }
}

export function submitPost(post, token) {
  //console.log(post, 'submitPost init');
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
      //console.log(response, 'submitPost response');
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
      console.log(error, 'create post error')
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
    return fetch(process.env.API_SERVER+'/api/post?_id='+postId, {
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
      return true;
    })
    .catch((error) => {
      console.log(error, 'error');
      return false;
    });
  }
}

export function irrelevant(token, postId) {
  return function(dispatch) {
    fetch(process.env.API_SERVER+'/api/post/irrelevant/'+postId+'?access_token='+token, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'PUT',
    })
    .then(utils.fetchError.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      console.log(responseJSON, 'irrelevant response')
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}

export function updateComment(comment, authToken) {
    return function(dispatch) {
       return fetch(process.env.API_SERVER+'/api/comment?access_token='+authToken, {
            credentials: 'include',
            method: 'PUT',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(comment)
        })
        .then((response) => {
            console.log('updated comment');
            return true;
        })
        .catch((error) => {
            console.log(error, 'error');
            return false;
        });
    }
}

export function editPost(post, authToken) {
    return function(dispatch) {
       return fetch(process.env.API_SERVER+'/api/post?access_token='+authToken, {
            credentials: 'include',
            method: 'PUT',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(post)
        })
        .then((response) => response.json())
        .then((responseJSON) => {
          dispatch(updatePost(responseJSON));
          // dispatch(updatePost(responseJSON));
          dispatch(authActions.getUser(post.user._id))
          return true;
        })
        .catch((error) => {
            console.log(error, 'error');
            return false;
        });
    }
}

export function deleteComment(token, id, postId) {
  return function(dispatch) {
    fetch(process.env.API_SERVER+'/api/comment/'+id+'?access_token='+token, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
    })
    .then(utils.fetchError.handleErrors)
    .then((response) => {
      // dispatch(getComments(postId));
      dispatch(authActions.getUser(token, false))
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
      console.log(responseJSON, 'created comment');
     dispatch(authActions.getUser(token, false))
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  }
}


export function setActivePost(post) {
  var set = post ? post : null;
    return {
        type: types.SET_ACTIVE_POST,
        payload: set
    };
}

export function setComments(comments) {
    return {
        type: types.SET_COMMENTS,
        payload: comments
    };
}
