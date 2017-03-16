import * as types from './actionTypes';
import * as utils from '../utils';

const reqOptions = () => {
  let token = utils.auth.getToken();
  return {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  };
};

export function setParentTags(data) {
  return {
    type: types.SET_PARENT_TAGS,
    payload: data
  };
}

export function updateParentTag(tag) {
  return {
    type: types.UPDATE_PARENT_TAG,
    payload: tag
  };
}

export function createTag(tag) {
  return (dispatch) =>
    fetch('/api/tag', {
      ...reqOptions(),
      method: 'POST',
      body: JSON.stringify(tag)
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setParentTags([responseJSON]));
    });
}

export function updateTag(tag) {
  return (dispatch) =>
    fetch('/api/tag/categories', {
      ...reqOptions(),
      method: 'PUT',
      body: JSON.stringify(tag)
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(updateParentTag(responseJSON));
    });
}

export function getParentTags() {
  return (dispatch) =>
    fetch('/api/tag/categories', {
      method: 'GET',
      ...reqOptions()
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setParentTags(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'parents error');
    });
}
