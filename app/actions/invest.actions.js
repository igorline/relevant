import { normalize, schema } from 'normalizr';
import * as types from './actionTypes';
import * as utils from '../utils';

utils.api.env();

const linkSchema = new schema.Entity(
  'links',
  {},
  { idAttribute: '_id' }
);

const postSchema = new schema.Entity(
  'posts',
  { metaPost: linkSchema },
  { idAttribute: '_id' }
);

const userSchema = new schema.Entity(
  'users',
  {},
  { idAttribute: '_id' }
);

const investmentSchema = new schema.Entity(
  'investments',
  {
    post: postSchema,
    investor: userSchema
  },
  { idAttribute: '_id' }
);

export function updatePostVote(vote) {
  return {
    type: types.UPDATE_POST_INVESTMENTS,
    payload: [vote]
  };
}

export function undoPostVote(post) {
  return {
    type: types.UNDO_POST_INVESTMENT,
    payload: post
  };
}

export function setPosts(data) {
  return {
    type: 'SET_POSTS_SIMPLE',
    payload: { data }
  };
}

export function setInvestments(investments, userId, index) {
  return {
    type: 'SET_INVESTMENTS',
    payload: {
      investments,
      userId,
      index
    }
  };
}

export function loadingInvestments() {
  return {
    type: types.LOADING_INVESTMENTS,
  };
}

export function setPostInvestments(data, postId, skip) {
  return {
    type: types.SET_POST_INVESTMENTS,
    payload: {
      postId,
      data,
      index: skip,
    }
  };
}

export function setUsers(users) {
  return {
    type: types.SET_USERS,
    payload: users
  };
}

// optimistic ui
export function vote(amount, post, user, undo) {
  return async dispatch => {
    try {
      if (undo) dispatch(undoPostVote(post._id));
      else dispatch(updatePostVote({ post: post._id, amount }));
      let res = await utils.api.request({
        method: 'POST',
        endpoint: 'invest',
        path: '/',
        body: JSON.stringify({
          investor: user._id,
          amount,
          post
        }),
      });
      return res;
    } catch (error) {
      if (undo) dispatch(updatePostVote({ post: post._id, amount }));
      else dispatch(undoPostVote(post._id));
      throw new Error(error.message);
    }
  };
}

export function getInvestments(token, userId, skip, limit) {
  return async dispatch => {
    try {
      dispatch(loadingInvestments());
      let res = await utils.api.request({
        method: 'GET',
        endpoint: 'invest',
        path: '/' + userId,
        query: { skip, limit }
      });
      let data = normalize(
        { investments: res },
        { investments: [investmentSchema] }
      );
      dispatch(setPosts(data));
      dispatch(setInvestments(data, userId, skip));
    } catch (err) {
      console.log(err);
    }
  };
}

export function loadingPostInvestments(postId) {
  return {
    type: types.LOADING_POST_INVESTMENTS,
    payload: postId
  };
}


export function getPostInvestments(postId, limit, skip) {
  return async (dispatch) => {
    try {
      dispatch(loadingPostInvestments(postId));
      let res = await utils.api.request({
        method: 'GET',
        endpoint: 'invest',
        query: { skip, limit },
        path: `/post/${postId}`,
      });
      let data = normalize(
        { investments: res },
        { investments: [investmentSchema] }
      );
      dispatch(setUsers(data.entities.users));
      dispatch(setPostInvestments(data, postId, skip));
    } catch (error) {
      console.warn(error);
    }
  };
}


// export function destroyInvestment(token, amount, post, investingUser) {
//   return dispatch => {
//     return fetch( process.env.API_SERVER + '/api/invest/destroy?access_token='+token, {
//       credentials: 'include',
//       method: 'DELETE',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         investor: investingUser._id,
//         poster: post.user._id,
//         amount,
//         post: post._id
//       })
//     })
//     .then((response) => response.json())
//     .then(() => true)
//     .catch((error) => {
//       console.log(error);
//       return false;
//     });
//   };
// }
