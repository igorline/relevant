import * as types from './actionTypes';
import * as utils from '../utils';
import * as authActions from './auth.actions';

require('../publicenv');

const apiServer = process.env.API_SERVER + '/api/';

// load 5 posts at a time
const limit = 5;


export function setPosts(data, type, index) {
  return {
    type: types.SET_POSTS,
    payload: {
      data,
      type,
      index
    }
  };
}

export function getFeed(token, skip, tag) {
  if (!skip) skip = 0;

  let url = `${apiServer}feed`
    + `?access_token=${token}`
    + `&skip=${skip}`
    + `&limit=${limit}`;

  if (tag) {
    url = `${apiServer}feed`
    + `?access_token=${token}`
    + `&skip=${skip}`
    + `&tag=${tag._id}`
    + `&limit=${limit}`;
  }

  let type = 'feed';

  return (dispatch) => {
    fetch(url, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'GET',
    })
    .then(response => {
      return response.json()
    })
    .then((responseJSON) => {
      console.log(responseJSON)
      dispatch(setPosts(responseJSON, type, skip));
    })
    .catch((error) => {
      console.log("Feed error")
      console.log(error, 'error');
    });
  };
}

export function deletePost(token, post) {
  var url = process.env.API_SERVER+'/api/post/'+post._id+'?access_token='+token;
  return (dispatch) => {
    fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
    })
    .then((response) => {
      console.log(response, 'delete response');
      dispatch(removePost(post));
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
      type: type,
    }
  };
}



export function getPostsAction() {
  return {
    type: 'GET_POSTS',
    payload: null,
  };
}

export function getPosts(skip, tags, sort, limit) {
  // console.log(skip, tags, sort);
  let tagsString = '';
  if (!skip) skip = 0;
  if (!limit) limit = 5;
  if (!sort) sort = null;

  // change this if we want to store top and new in separate places
  const type = sort ? 'top' : 'new';

  let url = process.env.API_SERVER + '/api/post?skip=' + skip + '&sort=' + sort + '&limit=' + limit;

  if (tags && tags.length) {
    tags.forEach((tag, i) => {
      console.log(tag._id);
      if (tag._id) {
        if (i === tags.length - 1) {
          tagsString += tag._id;
        } else {
          let alter = tag._id;
          tagsString += alter += ',';
        }
      }
    });

    url = process.env.API_SERVER+'/api/post?skip='+skip+'&tag='+tagsString+'&sort='+sort+'&limit='+limit;
  }

  return (dispatch) => {
    dispatch(getPostsAction());

    fetch(url, {
        credentials: 'include',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setPosts(responseJSON, type, skip));
    })
    .catch((error) => {
        console.log(error, 'error');
    });
  }
}


export function getUserPosts(skip, limit, userId, type) {
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
      dispatch(setPosts(responseJSON, type, skip));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  };
}

export function setUserPosts(posts) {
  return {
    type: 'SET_USER_POSTS',
    payload: posts
  };
}

export function setMyPosts(posts) {
  return {
    type: 'SET_MY_POSTS',
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

export function removePost(post) {
  return {
    type: types.REMOVE_POST,
    payload: post
  }
}

// export function dispatchPost(post, token) {
//    return function(dispatch) {
//     return fetch(process.env.API_SERVER+'/api/post?access_token='+token, {
//         credentials: 'include',
//         method: 'POST',
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(post)
//     })
//     .then((response) => {
//       //console.log(response, 'submitPost response');
//       if (response.status == 200) {
//         return true;
//       } else {
//         return false;
//       }
//     })
//     .catch((error) => {
//       console.log(error, 'create post error')
//       return false;
//     });
//    }
// }

export function postError() {
  return {
    type: types.POST_ERROR,
  };
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

export function getComments(postId, skip, limit) {
  return function(dispatch) {
    if (!skip) skip = 0;
    if (!limit) limit = 5;
    
    fetch(process.env.API_SERVER+'/api/comment?post='+postId+'&skip='+skip+'&limit='+limit, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'GET',
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setComments(responseJSON, skip));
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

export function getSelectedPost(postId) {
  return function(dispatch) {
    return fetch(process.env.API_SERVER+'/api/post/'+postId, {
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
      dispatch(setSelectedPostData(responseJSON));
      return true;
    })
    .catch((error) => {
      console.log(error, 'error');
      return false;
    });
  };
}

export function setSelectedPost(id) {
  return {
    type: 'SET_SELECTED_POST',
    payload: id
  };
}

export function setSelectedPostData(post) {
  return {
    type: 'SET_SELECTED_POST_DATA',
    payload: post
  };
}

export function clearSelectedPost() {
  return {
    type: 'CLEAR_SELECTED_POST'
  };
}

export function setComments(comments, index) {
  let num = 0;
  if (index) num = index;
    return {
      type: types.SET_COMMENTS,
      payload: {
        data: comments,
        index: num
      }
    };
}












