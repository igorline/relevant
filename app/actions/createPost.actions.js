/* eslint-disable no-console */
import * as types from './actionTypes';
import * as utils from '../utils';

utils.api.env();

export function setCreaPostState(state) {
  return {
    type: types.SET_CREATE_POST_STATE,
    payload: state
  };
}

export function setPostCategory(tag) {
  const set = tag || null;
  return {
    type: 'SET_POST_CATEGORY',
    payload: set
  };
}

export function clearCreatePost() {
  return {
    type: 'CLEAR_CREATE_POST'
  };
}

export function submitPost(post) {
  return async () => {
    try {
      await utils.api.request({
        method: 'POST',
        endpoint: 'post',
        body: JSON.stringify(post)
      });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };
}
