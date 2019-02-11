/* eslint-disable no-console */
import * as types from 'core/actionTypes';
import * as utils from 'app/utils';

const Alert = utils.alert.Alert();

export function setCreatePostState(state) {
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
      Alert.alert('Error creating post', err.message);
      return false;
    }
  };
}

// TODO update to use api util
export function generatePreviewServer(link) {
  return () =>
    fetch(
      process.env.API_SERVER +
        '/api/post/preview/generate?url=' +
        encodeURIComponent(link),
      { method: 'GET' }
    )
    .then(response =>
    // console.log(response, 'response');
      response.json()
    )
    .then(
      responseJSON =>
      // console.log(responseJSON, 'responseJSON');
        responseJSON
    )
    .catch(false);
}
