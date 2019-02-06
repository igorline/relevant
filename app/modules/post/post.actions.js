import { normalize, schema } from 'normalizr';
import * as types from 'core/actionTypes';
import { token, api, alert } from 'app/utils';
import * as errorActions from 'modules/ui/error.actions';
import * as navigationActions from 'modules/navigation/navigation.actions';

const Alert = alert.Alert();

const apiServer = process.env.API_SERVER + '/api/';
const userSchema = new schema.Entity('users', {}, { idAttribute: '_id' });
const repostSchema = new schema.Entity('posts', { idAttribute: '_id' });

let metaPostSchema;
const linkSchema = new schema.Entity('links', {}, { idAttribute: '_id' });

const parentPostSchema = new schema.Entity(
  'posts',
  {
    metaPost: linkSchema,
    user: userSchema
  },
  { idAttribute: '_id' }
);


const postSchema = new schema.Entity(
  'posts',
  {
    user: userSchema,
    repost: { post: repostSchema },
    metaPost: linkSchema,
    parentPost: parentPostSchema,
    commentPost: parentPostSchema,
  },
  { idAttribute: '_id' }
);

const feedSchema = new schema.Entity(
  'posts',
  {
    commentary: [postSchema],
    new: [postSchema],
    top: [postSchema],
    twitterFeed: [postSchema],

    user: userSchema,
    repost: { post: repostSchema },
    metaPost: linkSchema
    // twitterCommentary: [postSchema],
  },
  {
    idAttribute: '_id',
    processStrategy: (value, parent, key) => {
      value[key] = value.commentary;
      return value;
    }
  }
);

const reqOptions = tk => ({
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${tk}`
  }
});

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
    type: types.POST_ERROR
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
  const type = 'feed';
  const limit = DEFAULT_LIMIT;
  const tag = _tag ? _tag._id : null;

  return dispatch =>
    api
    .request({
      method: 'GET',
      query: { skip, limit, tag },
      endpoint: 'feed',
      path: '/'
    })
    .then(res => {
      const data = normalize({ feed: res }, { feed: [postSchema] });
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
  const type = 'twitterFeed';
  const limit = DEFAULT_LIMIT;
  const tag = _tag ? _tag._id : null;

  return dispatch =>
    api
    .request({
      method: 'GET',
      query: { skip, limit, tag },
      endpoint: 'twitterFeed',
      path: '/'
    })
    .then(res => {
      const data = normalize({ twitterFeed: res }, { twitterFeed: [feedSchema] });
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
    api
    .request({
      method: 'DELETE',
      endpoint: 'post',
      params: { id: post._id }
    })
    .then(() => {
      dispatch(removePost(post));
      if (redirect) dispatch(navigationActions.pop());
    })
    .catch(null);
}

export function clearPosts(type) {
  return {
    type: types.CLEAR_POSTS,
    payload: {
      type
    }
  };
}

export function getPostsAction(type) {
  return {
    type: 'GET_POSTS',
    payload: type
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

// this function queries the meta posts
export function getPosts(skip, tags, sort, limit) {
  let tagsString = '';
  if (!skip) skip = 0;
  if (!limit) limit = DEFAULT_LIMIT;
  if (!sort) sort = null;
  let tag = null;

  // change this if we want to store top and new in separate places
  const type = sort ? 'top' : 'new';
  const endpoint = 'communityFeed';
  let topic;

  if (tags && tags.length) {
    tagsString = tags.map(t => t._id || t).join(', ');
    tag = tagsString;
    if (tags.length === 1) topic = tags[0];
  }

  return async dispatch => {
    try {
      dispatch(getPostsAction(type));

      const res = await api.request({
        method: 'GET',
        endpoint,
        query: { skip, sort, limit, tag }
      });
      const dataType = feedSchema;
      const data = normalize({ [type]: res }, { [type]: [dataType] });

      // dispatch(setUsers(data.entities.users));

      if (topic) {
        dispatch(setTopic(data, type, skip, topic));
      } else dispatch(setPosts(data, type, skip));
      dispatch(errorActions.setError('discover', false));
    } catch (error) {
      dispatch(errorActions.setError('discover', true, error.message));
    }
  };
}

export function loadingUserPosts() {
  return {
    type: 'LOADING_USER_POSTS'
  };
}

export function getUserPosts(skip, limit, userId) {
  if (!skip) skip = 0;
  if (!limit) limit = 5;
  return async dispatch => {
    dispatch(loadingUserPosts());
    return api
    .request({
      method: 'GET',
      endpoint: 'post/user',
      params: { id: userId },
      query: { skip, limit }
    })
    .then(responseJSON => {
      const data = normalize({ [userId]: responseJSON }, { [userId]: [postSchema] });
      dispatch(setUsers(data.entities.users));
      dispatch(setUserPosts(data, userId, skip));
      dispatch(errorActions.setError('profile', false));
    })
    .catch(error => {
      dispatch(errorActions.setError('profile', true, error.message));
    });
  };
}

export function addUpdatedComment(comment) {
  return {
    type: 'UPDATE_COMMENT',
    payload: comment
  };
}

export function editPost(post) {
  return async dispatch => {
    try {
      const response = await api.request({
        method: 'PUT',
        endpoint: 'post',
        body: JSON.stringify(post)
      });
      dispatch(updatePost(response));
      return true;
    } catch (err) {
      Alert.alert('Post error please try again', err.message);
      return false;
    }
  };
}

export function getSelectedPost(postId) {
  return async dispatch => {
    try {
      const responseJSON = await api.request({
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
      const responseJSON = await api.request({
        method: 'GET',
        endpoint: 'metaPost',
        path: '/related',
        params: { id: postId }
      });
      dispatch(
        updateRelated({
          related: responseJSON,
          postId
        })
      );
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

export function setSubscriptions(data) {
  return {
    type: types.SET_SUBSCRIPTIONS,
    payload: data
  };
}

export function getSubscriptions() {
  return dispatch =>
    token
    .get()
    .then(tk =>
      fetch(`${apiServer}subscription/user`, {
        ...reqOptions(tk),
        method: 'GET'
      })
    )
    .then(response => response.json())
    .then(responseJSON => dispatch(setSubscriptions(responseJSON)))
    .catch(null);
}

export function flag(post) {
  return dispatch =>
    token
    .get()
    .then(tk =>
      fetch(`${apiServer}post/flag`, {
        ...reqOptions(tk),
        method: 'PUT',
        body: JSON.stringify({ postId: post._id })
      })
    )
    .then(response => response.json())
    .then(responseJSON => {
      Alert.alert('Thank you', 'Flagged posts will be reviewed by the administrators');
      dispatch(updatePost(responseJSON));
    })
    .catch(null);
}

export function getPostHtml(post) {
  return dispatch =>
    fetch(`${apiServer}post/readable?uri=${post.link}`, {
      method: 'GET'
    })
    .then(response => response.text())
    .then(html => {
      dispatch(updatePost({ ...post, html }));
    })
    .catch(null);
}

export function setTopPosts(data) {
  return {
    type: types.SET_TOP_POSTS,
    payload: data
  };
}

export function getFlaggedPosts(skip) {
  if (!skip) skip = 0;
  const type = 'flagged';

  function getUrl() {
    const url = `${apiServer}metaPost/flagged?skip=${skip}&limit=${DEFAULT_LIMIT}`;
    return url;
  }

  return async dispatch => {
    // dispatch(getPostsAction(type));
    fetch(getUrl(), {
      method: 'GET',
      ...(await api.reqOptions())
    })
    .then(response => response.json())
    .then(responseJSON => {
      const dataType = metaPostSchema;
      const data = normalize({ [type]: responseJSON }, { [type]: [dataType] });
      dispatch(setPosts(data, type, skip));
      // dispatch(errorActions.setError(type, false));
    })
    .catch(error => {
      Alert('Feed error ', error);
      if (!error.message.match('Get fail for key: token')) {
        // dispatch(errorActions.setError(type, true, error.message));
      }
    });
  };
}

export function getTopPosts() {
  return async dispatch => {
    try {
      const responseJSON = await api.request({
        method: 'GET',
        endpoint: 'post',
        path: '/topPosts'
      });
      return dispatch(setTopPosts(responseJSON));
    } catch (error) {
      return false;
    }
  };
}
