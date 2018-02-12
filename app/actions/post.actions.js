import { normalize, schema } from 'normalizr';
import * as types from './actionTypes';
import * as utils from '../utils';
import * as errorActions from './error.actions';
import * as navigationActions from './navigation.actions';

const Alert = utils.api.Alert();

utils.api.env();
const apiServer = process.env.API_SERVER + '/api/';

const commentSchema = new schema.Entity('comments',
  {},
  { idAttribute: '_id' }
);

const userSchema = new schema.Entity('users',
  {},
  { idAttribute: '_id' }
);

const repostSchema = new schema.Entity('posts',
  { comments: [commentSchema], user: userSchema },
  { idAttribute: '_id' }
);

let metaPostSchema;

const postSchema = new schema.Entity('posts',
  {
    comments: [commentSchema],
    user: userSchema,
    repost: { post: repostSchema },
    metaPost: metaPostSchema
  },
  { idAttribute: '_id' }
);

metaPostSchema = new schema.Entity('metaPosts',
  {
    commentary: [postSchema],
    // twitterCommentary: [postSchema],
    // new: [postSchema],
    // top: [postSchema],
  },
  { idAttribute: '_id' }
);

const reqOptions = (token) => {
  return {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  };
};


// load 5 posts at a time
const DEFAULT_LIMIT = 10;

export function setUsers(users) {
  return {
    type: types.SET_USERS,
    payload: users
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

export function updateRelated(related) {
  return {
    type: types.SET_RELATED,
    payload: related
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

export function setTopic(data, type, index, topic) {
  return {
    type: types.SET_TOPIC_POSTS,
    payload: {
      topic: topic._id || topic,
      data,
      type,
      index
    }
  };
}

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

export function getFeed(skip, _tag) {
  if (!skip) skip = 0;
  let type = 'feed';
  let limit = DEFAULT_LIMIT;
  let tag = _tag ? _tag._id : null;

  return dispatch =>
    utils.api.request({
      method: 'GET',
      query: { skip, limit, tag },
      endpoint: 'feed',
      path: '/',
    })
    .then(res => {
      let data = normalize(
        { feed: res },
        { feed: [postSchema] }
      );
      dispatch(setUsers(data.entities.users));
      dispatch(setPosts(data, type, skip));
      dispatch(errorActions.setError('read', false));
    })
    .catch(err => {
      // TODO do we need this?
      if (!err.message.match('Get fail for key: token')) {
        dispatch(errorActions.setError('read', true, err.message));
      }
    });
}


export function getTwitterFeed(skip, _tag) {
  if (!skip) skip = 0;
  let type = 'twitterFeed';
  let limit = DEFAULT_LIMIT;
  let tag = _tag ? _tag._id : null;

  return dispatch =>
    utils.api.request({
      method: 'GET',
      query: { skip, limit, tag },
      endpoint: 'twitterFeed',
      path: '/',
    })
    .then(res => {
      let data = normalize(
        { twitterFeed: res },
        { twitterFeed: [metaPostSchema] }
      );
      dispatch(setPosts(data, type, skip));
      dispatch(errorActions.setError('read', false));
    })
    .catch(err => {
      // TODO do we need this?
      if (!err.message.match('Get fail for key: token')) {
        dispatch(errorActions.setError('read', true, err.message));
      }
    });
}


export function deletePost(post, redirect) {
  return dispatch =>
    utils.api.request({
      method: 'DELETE',
      endpoint: 'post',
      params: { id: post._id }
    })
    .then(() => {
      dispatch(removePost(post));
      if (redirect) dispatch(navigationActions.pop());
    })
    .catch(error => console.log(error, 'error'));
}

export function clearPosts(type) {
  return {
    type: types.CLEAR_POSTS,
    payload: {
      type,
    }
  };
}

export function getPostsAction(type) {
  return {
    type: 'GET_POSTS',
    payload: type,
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

export function addComment(postId, newComment) {
  return {
    type: types.ADD_COMMENT,
    payload: {
      comment: newComment,
      postId
    }
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

// this function queries the meta posts
export function getPosts(skip, tags, sort, limit, community) {
  // console.log(skip, tags, sort);
  let tagsString = '';
  if (!skip) skip = 0;
  if (!limit) limit = DEFAULT_LIMIT;
  if (!sort) sort = null;
  let tag = null;

  // change this if we want to store top and new in separate places
  const type = sort ? 'top' : 'new';
  let endpoint = 'metaPost';
  // TODO migrate community
  if (community === 'crypto') endpoint = 'communityFeed';
  let topic;

  if (tags && tags.length) {
    tagsString = tags.map(t => t._id || t).join(', ');
    tag = tagsString;
    if (tags.length === 1) topic = tags[0];
  }

  return dispatch => {
    dispatch(getPostsAction(type));
    return utils.api.request({
      method: 'GET',
      endpoint,
      query: { skip, sort, limit, tag }
    })
    .then((responseJSON) => {
      let dataType = metaPostSchema;
      let data = normalize(
        { [type]: responseJSON },
        { [type]: [dataType] }
      );
      dispatch(setUsers(data.entities.users));
      if (topic) {
        dispatch(setTopic(data, type, skip, topic));
      } else dispatch(setPosts(data, type, skip));
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

export function getUserPosts(skip, limit, userId) {
  if (!skip) skip = 0;
  if (!limit) limit = 5;
  return async (dispatch) => {
    dispatch(loadingUserPosts());
    return utils.api.request({
      method: 'GET',
      endpoint: 'post/user',
      params: { id: userId },
      query: { skip, limit }
    })
    .then((responseJSON) => {
      let data = normalize(
        { [userId]: responseJSON },
        { [userId]: [postSchema] }
      );
      dispatch(setUsers(data.entities.users));
      dispatch(setUserPosts(data, userId, skip));
      dispatch(errorActions.setError('profile', false));
    })
    .catch((error) => {
      console.log(error, 'error');
      dispatch(errorActions.setError('profile', true, error.message));
    });
  };
}

export function addUpdatedComment(updatedComment) {
  return {
    type: 'UPDATE_COMMENT',
    payload: {
      data: updatedComment,
    }
  };
}

export function updateComment(comment) {
  return dispatch =>
    utils.api.request({
      method: 'PUT',
      endpoint: 'comment',
      body: JSON.stringify(comment),
    })
    .then(res => dispatch(addUpdatedComment(res)))
    .catch(error => Alert.alert(error.message));
}

export function editPost(post) {
  return dispatch =>
    utils.api.request({
      method: 'PUT',
      endpoint: 'post',
      body: JSON.stringify(post),
    })
    .then(res => dispatch(updatePost(res)))
    .catch(err => Alert.alert('Post error please try again'));
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

export function deleteComment(token, id, postId) {
  return dispatch =>
    fetch(process.env.API_SERVER + '/api/comment/' + id + '?access_token=' + token, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
    })
    .then((response) => {
      dispatch(removeCommentEl(postId, id));
    })
    .catch((error) => {
      Alert.alert(error.message);
      console.log(error, 'error');
    });
}


export function getComments(postId, skip, limit) {
  return function(dispatch) {
    if (!skip) skip = 0;
    if (!limit) limit = 5;

    fetch(process.env.API_SERVER+'/api/comment?post='+postId+'&skip='+skip+'&limit='+limit, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
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
  };
}

export function createComment(token, commentObj) {
  return function(dispatch) {
    return fetch(process.env.API_SERVER + '/api/comment?access_token=' + token, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(commentObj)
    })
    .then(utils.api.handleErrors)
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(addComment(responseJSON.post, responseJSON));
      return true;
    })
    .catch((error) => {
      console.log(error, 'error');
      Alert.alert(error.message);
      return false;
    });
  };
}

export function getSelectedPost(postId) {
  return async dispatch => {
    try {
      let responseJSON = await utils.api.request({
        method: 'GET',
        endpoint: 'post',
        path: '',
        params: { id: postId }
      });
      if (!responseJSON) {
        dispatch(removePost(postId));
      } else {
        dispatch(updatePost(responseJSON));
      }
      dispatch(errorActions.setError('singlepost', false));
      return responseJSON;
    } catch (error) {
      dispatch(errorActions.setError('singlepost', true, error.message));
      return false;
    }
  };
}

export function getRelated(postId) {
  return async dispatch => {
    try {
      let responseJSON = await utils.api.request({
        method: 'GET',
        endpoint: 'metaPost',
        path: '/related',
        params: { id: postId }
      });
      dispatch(updateRelated({
        related: responseJSON,
        postId
      }));
      return responseJSON;
    } catch (error) {
      return false;
    }
  };
}


export function setFeedCount(data) {
  return {
    type: types.SET_FEED_COUNT,
    payload: data
  };
}


export function markFeedRead() {
  return dispatch =>
    utils.token.get()
    .then(token =>
      fetch(`${apiServer}feed/markread`, {
        ...reqOptions(token),
        method: 'PUT',
      })
    )
    .then((res) => {
      dispatch(setFeedCount(null));
    })
    .catch(error => console.log('error', error));
}

export function getFeedCount() {
  return dispatch =>
    utils.token.get()
    .then(token =>
      fetch(`${apiServer}feed/unread`, {
        ...reqOptions(token),
        method: 'GET'
      })
    )
    .then(response => response.json())
    .then(responseJSON => dispatch(setFeedCount(responseJSON.unread)))
    .catch(err => console.log('Notification count error', err));
}

export function setSubscriptions(data) {
  return {
    type: types.SET_SUBSCRIPTIONS,
    payload: data,
  };
}

export function getSubscriptions() {
  return dispatch =>
    utils.token.get()
    .then(token =>
      fetch(`${apiServer}subscription/user`, {
        ...reqOptions(token),
        method: 'GET'
      })
    )
    .then(response => response.json())
    .then(responseJSON => dispatch(setSubscriptions(responseJSON)))
    .catch(err => console.log('Subscription error', err));
}

export function flag(post) {
  return dispatch =>
    utils.token.get()
    .then(token =>
      fetch(`${apiServer}post/flag`, {
        ...reqOptions(token),
        method: 'PUT',
        body: JSON.stringify({ postId: post._id })
      })
    )
    .then(response => response.json())
    .then(responseJSON => {
      Alert.alert('Thank you', 'Flagged posts will be reviewed by the administrators');
      dispatch(updatePost(responseJSON));
    })
    .catch(err => console.log('Subscription error', err));
}

export function getPostHtml(post) {
  return dispatch =>
    // fetch(post.link, {
    fetch(`${apiServer}post/readable?uri=${post.link}`, {
      headers: {
        // 'Content-Type': 'application/json',
        // 'x-api-key': process.env.READER_API
      },
      method: 'GET'
    })
    .then(response => response.text())
    .then(html => {
      console.log(html);
      dispatch(updatePost({ ...post, html }));
    })
    .catch(err => console.log('Subscription error', err));
}

export function setTopPosts(data) {
  return {
    type: types.SET_TOP_POSTS,
    payload: data,
  };
}

export function getTopPosts() {
  return async dispatch => {
    try {
      let responseJSON = await utils.api.request({
        method: 'GET',
        endpoint: 'post',
        path: '/topPosts',
      });
      // console.log('top posts ', responseJSON);
      return dispatch(setTopPosts(responseJSON));
    } catch (error) {
      return false;
    }
  };
}

export function sendPostNotification(post) {
  return async dispatch => {
    try {
      let responseJSON = await utils.api.request({
        method: 'POST',
        endpoint: 'post',
        path: '/sendPostNotification',
        body: JSON.stringify(post),
      });
      Alert.alert('Notification sent!');
      // return dispatch(setTopPosts(responseJSON));
    } catch (error) {
      return false;
    }
  };
}


// export function getPostHtml(post) {
//   return dispatch =>
//     // fetch(post.link, {
//     fetch('https://mercury.postlight.com/parser?url=' + post.link, {
//       headers: {
//         'Content-Type': 'application/json',
//         'x-api-key': process.env.READER_API
//       },
//       method: 'GET'
//     })
//     .then(response => response.json())
//     .then(responseJSON => {
//       console.log(responseJSON);
//       dispatch(updatePost({ ...post, html: responseJSON.content }));
//     })
//     .catch(err => console.log('Subscription error', err));
// }

export function getFlaggedPosts(skip) {
  if (!skip) skip = 0;
  let type = 'flagged';

  function getUrl() {
    let url = `${apiServer}metaPost/flagged?skip=${skip}&limit=${DEFAULT_LIMIT}`;
    return url;
  }

  return async dispatch => {
    // dispatch(getPostsAction(type));
    fetch(getUrl(), {
      method: 'GET',
      ...await utils.api.reqOptions()
    })
    .then(response => response.json())
    .then((responseJSON) => {
      let dataType = metaPostSchema;
      let data = normalize(
        { [type]: responseJSON },
        { [type]: [dataType] }
      );
      dispatch(setPosts(data, type, skip));
      // dispatch(errorActions.setError(type, false));
    })
    .catch((error) => {
      console.log('Feed error ', error);
      if (!error.message.match('Get fail for key: token')) {
        // dispatch(errorActions.setError(type, true, error.message));
      }
    });
  };
}
