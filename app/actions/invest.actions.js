import { normalize, schema } from 'normalizr';
import {
    AlertIOS
} from 'react-native';
import * as types from './actionTypes';
import * as utils from '../utils';

require('../publicenv');

let apiServer = process.env.API_SERVER + '/api/';

const postSchema = new schema.Entity('posts',
  {},
  { idAttribute: '_id' }
);

const userSchema = new schema.Entity('users',
  {},
  { idAttribute: '_id' }
);

const investmentSchema = new schema.Entity('investments',
  { post: postSchema, investor: userSchema },
  { idAttribute: '_id' }
);

export function updatePostInvest(posts) {
  return {
    type: types.UPDATE_POSTS_INVEST,
    payload: posts
  };
}

export function undoPostInvest(post) {
  return {
    type: types.UNDO_POSTS_INVEST,
    payload: post
  };
}

export function setPosts(posts) {
  return {
    type: 'SET_POSTS_SIMPLE',
    payload: posts
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

export function invest(token, amount, post, investingUser) {
  return (dispatch) => {
    dispatch(updatePostInvest([post._id]));
    return fetch(apiServer + 'invest?access_token=' + token, {
      credentials: 'include',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        investor: investingUser._id,
        amount,
        post
      })
    })
    .then(response => response.json())
    .then((data) => {
      if (data && !data.success) {
        dispatch(undoPostInvest(post._id));
        if (data.message) throw Error(data.message);
        return false;
      }
      return data;
    })
    .catch((error) => {
      dispatch(undoPostInvest(post._id));
      console.log(error, 'error here');
      throw Error(error.message);
      // AlertIOS.alert(error.message);
    });
  };
}

export function loadingInvestments() {
  return {
    type: types.LOADING_INVESTMENTS,
  };
}


export function getInvestments(token, userId, skip, limit, type){
  return (dispatch) => {
    dispatch(loadingInvestments());
    return fetch(apiServer + 'invest/' + userId + '?skip=' + skip + '&limit=' + limit + '&access_token=' + token, {
      credentials: 'include',
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then((responseJSON) => {
      // dispatch(refreshInvestments(responseJSON, userId, skip));

      let data = normalize(
        { investments: responseJSON },
        { investments: [investmentSchema] }
      );
      dispatch(setPosts(data.entities.posts));
      dispatch(setInvestments(data, userId, skip));
    })
    .catch((error) => {
      console.log(error);
    });
  };
}

export function destroyInvestment(token, amount, post, investingUser){
  return dispatch => {
    return fetch( process.env.API_SERVER + '/api/invest/destroy?access_token='+token, {
      credentials: 'include',
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        investor: investingUser._id,
        poster: post.user._id,
        amount,
        post: post._id
      })
    })
    .then((response) => response.json())
    .then(() => true)
    .catch((error) => {
      console.log(error);
      return false;
    });
  };
}


export function loadingPostInvestments(postId) {
  return {
    type: types.LOADING_POST_INVESTMENTS,
    payload: postId
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

export function getPostInvestments(postId, limit, skip) {
  return async (dispatch) => {
    dispatch(loadingPostInvestments(postId));

    let params = `?skip=${skip}&limit=${limit}`;
    let url = `${apiServer}invest/post/${postId}${params}`;

    try {
      let response = await fetch(url, {
        method: 'GET',
        ...await utils.fetchUtils.reqOptions()
      });

      if (!response.ok) throw response.statusText;

      let responseJSON = await response.json();

      let data = normalize(
        { investments: responseJSON },
        { investments: [investmentSchema] }
      );
      dispatch(setUsers(data.entities.users));
      dispatch(setPostInvestments(data, postId, skip));
    } catch (error) {
      console.log(error);
    }
  };
}
