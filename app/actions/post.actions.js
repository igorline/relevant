import { normalize, schema } from 'normalizr';
import {
  AlertIOS
} from 'react-native';

import * as types from './actionTypes';
import * as utils from '../utils';
// import * as authActions from './auth.actions';
import * as errorActions from './error.actions';

require('../publicenv');

const comment = new schema.Entity('comments', {}, { idAttribute: '_id' });

const post = new schema.Entity('posts',
  { comments: [comment] },
  { idAttribute: '_id' }
);

const repost = new schema.Entity('posts',
  { comments: [comment], repost: { post } },
  { idAttribute: '_id' }
);

const metaPost = new schema.Entity('metaPosts', { commentary: [post] }, { idAttribute: '_id' });


// postSchema.define({
//   comments: arrayOf(repostSchema)
// });

// metaPostSchema.define({
//   commentary: arrayOf(postSchema)
// });


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

export function getFeed(skip, tag) {
  if (!skip) skip = 0;

  function getUrl(token) {
    let url = `${apiServer}feed`
      + `?access_token=${token}`
      + `&skip=${skip}`
      + `&limit=${limit}`;

    if (tag) {
      console.log(tag, 'tag here')
      url = `${apiServer}feed`
      + `?access_token=${token}`
      + `&skip=${skip}`
      + `&tag=${tag._id}`
      + `&limit=${limit}`;
    }
    return url;
  }

  let type = 'feed';

  return (dispatch) => {
    utils.token.get()
    .then(token =>
      fetch(getUrl(token), {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'GET',
      })
    )
    .then(response => response.json())
    .then((responseJSON) => {
      let data = normalize({feed: responseJSON}, { feed: [repost] });
      dispatch(setPosts(data, type, skip));
      dispatch(errorActions.setError('read', false));
    })
    .catch((error) => {
      console.log('Feed error ', error);
      if(!error.message.match("Get fail for key: token"))
        dispatch(errorActions.setError('read', true, error.message));
    });
  };
}

export function deletePost(token, post) {
  let url = apiServer +
    'post/' + post._id +
    '?access_token=' + token;

  return (dispatch) => {
    fetch(url, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
    })
    .then(() => dispatch(removePost(post)))
    .catch(error => console.log(error, 'error'));
  };
}

export function clearPosts(type) {
  return {
    type: types.CLEAR_POSTS,
    payload: {
      type,
    }
  };
}

export function getPostsAction() {
  return {
    type: 'GET_POSTS',
    payload: null,
  };
}


//this function queries the meta posts
export function getPosts(skip, tags, sort, limit) {
  // console.log(skip, tags, sort);
  let tagsString = '';
  if (!skip) skip = 0;
  if (!limit) limit = 5;
  if (!sort) sort = null;

  // change this if we want to store top and new in separate places
  const type = sort ? 'top' : 'new';

  let url = process.env.API_SERVER + '/api/metaPost?skip=' + skip + '&sort=' + sort + '&limit=' + limit;

  let category = '';
  if (tags && tags.length) {
    tags.forEach((tag, i) => {
      if (tag.category) {
        category = tag._id;
        return;
      }
      if (tag._id) {
        if (i === tags.length - 1) {
          tagsString += tag._id;
        } else {
          let alter = tag._id;
          tagsString += alter += ',';
        }
      }
    });

    url = apiServer +
      'post?skip=' + skip +
      '&tag=' + tagsString
      + '&sort=' + sort
      + '&limit=' + limit +
      '&category=' + category;
  }

  return (dispatch) => {
    dispatch(getPostsAction());

    fetch(url, {
      credentials: 'include',
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then((responseJSON) => {
      // console.log(responseJSON);
      let data = normalize(
        { [type]: responseJSON },
        { [type]: [metaPost] }
      );

      dispatch(setPosts(data, type, skip));
      dispatch(errorActions.setError('discover', false));
    })
    .catch((error) => {
      console.log(error, 'error');
      dispatch(errorActions.setError('discover', true, error.message));
    });
  };
}

export function loadingUserPosts() {
  return {
    type: 'LOADING_USER_POSTS',
  };
}

export function getUserPosts(skip, limit, userId, type) {
  var tagsString = '';
  if (!skip) skip = 0;
  if (!limit) limit = 5;
  return (dispatch) => {
    dispatch(loadingUserPosts());
    const url = process.env.API_SERVER + '/api/post/user/' + userId + '?skip=' + skip + '&limit=' + limit;
    setTimeout(() => {
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
        let data = normalize(
          { [userId]: responseJSON },
          { [userId]: [repost] }
        );
        dispatch(setUserPosts(data, userId, skip));
        dispatch(errorActions.setError('profile', false));
      })
      .catch((error) => {
        console.log(error, 'error');
        dispatch(errorActions.setError('profile', true, error.message));
      });
    }, 100);
  };
}

export function setUserPosts(data, id, index) {
  return {
    type: 'SET_USER_POSTS',
    payload: {
      data,
      id,
      index
    }
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
  };
}

export function removePost(post) {
  return {
    type: types.REMOVE_POST,
    payload: post
  };
}


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
        .then((response) => response.json())
        .then((responseJSON) => {
          dispatch(addUpdatedComment(responseJSON));
          return true;
        })
        .catch((error) => {
          console.log(error, 'error');
          AlertIOS.alert(error.message);
          return false;
        });
    }
}

export function addUpdatedComment(updatedComment) {
  return {
    type: 'UPDATE_COMMENT',
    payload: {
      data: updatedComment,
      postId: updatedComment.post,
    }
  };
}

export function editPost(post, authToken) {
  let response;
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
    .then(_response => {
      response = _response;
      return response.json();
    })
    .then((responseJSON) => {
      if (response.status === 200) {
        dispatch(updatePost(responseJSON));
        return true;
      } else {
        return false;
      }
    })
    .catch((error) => {
      console.log(error, 'error');
      return false;
    });
  };
}

export function deleteComment(token, id, postId) {
  return function(dispatch) {
    fetch(process.env.API_SERVER + '/api/comment/' + id + '?access_token=' + token, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
    })
    .then((response) => {
      dispatch(removeCommentEl(postId, id));
    })
    .catch((error) => {
      AlertIOS.alert(error.message);
      console.log(error, 'error');
    });
  }
}


export function removeCommentEl(postId, commentId) {
  if (!postId || !commentId) return;
  return {
    type: 'REMOVE_COMMENT',
    payload: {
      postId,
      commentId,
    }
  };
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
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(errorActions.setError('comments', false));
      dispatch(setComments(postId, responseJSON.data, skip, responseJSON.total));
    })
    .catch((error) => {
      console.log(error, 'error');
      dispatch(errorActions.setError('comments', true, error.message));
    });
  }
}

export function createComment(token, commentObj) {
  return function(dispatch) {
    return fetch(process.env.API_SERVER+'/api/comment?access_token='+token, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(commentObj)
    })
    .then(utils.fetchError.handleErrors)
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(setComments(responseJSON.post, responseJSON));
      return true;
    })
    .catch((error) => {
      AlertIOS.alert(error.message);
      console.log(error, 'error');
      return false;
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
      dispatch(errorActions.setError('singlepost', false));
      return true;
    })
    .catch((error) => {
      console.log(error, 'error');
      dispatch(errorActions.setError('singlepost', true, error.message));
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

export function archiveComments(postId) {
  return {
    type: types.ARCHIVE_COMMENTS,
    payload: postId
  };
}

export function setComments(postId, comments, index, total) {
  let num = 0;
  if (!total) total = 0;
  if (index) num = index;
  return {
    type: types.SET_COMMENTS,
    payload: {
      data: comments,
      index: num,
      postId,
      total,
    }
  };
}

