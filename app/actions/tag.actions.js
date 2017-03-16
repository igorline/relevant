import * as types from './actionTypes';
import * as utils from '../utils';

require('../publicenv');

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

export function getDiscoverTags() {
  return function(dispatch) {
    fetch(process.env.API_SERVER + '/api/tag?sort=count', {
      credentials: 'include',
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(utils.fetchUtils.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setDiscoverTags(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  };
}


export function setDiscoverTags(data) {
  return {
    type: types.SET_DISCOVER_TAGS,
    payload: data
  };
}

export function goToTag(tag) {
  return function(dispatch) {
    dispatch(setTag(tag));
  };
}

export function selectTag(tag) {
  return {
    type: 'SELECT_TAG',
    payload: tag
  };
}

export function deselectTag(tag) {
  return {
    type: 'DESELECT_TAG',
    payload: tag
  };
}

export function searchTags(tag) {
  return (dispatch) => {
    if (!tag || tag === '') {
      return dispatch(setDiscoverTags([]));
    }
    return fetch(process.env.API_SERVER + '/api/tag/search/' + tag, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(setDiscoverTags(responseJSON));
    })
    .catch(error => {
      console.log('Search error ', error);
    });
  };
}

export function createTag(token, tagObj) {
  return function(dispatch) {
    return fetch(process.env.API_SERVER+'/api/tag?access_token='+token, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tagObj)
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      return {status: true, data: responseJSON}
    })
    .catch((error) => {
      return {status: false, data: error};
    });
  };
}

export function setParentTags(data) {
  return {
    type: types.SET_PARENT_TAGS,
    payload: data
  };
}

export function getParentTags() {
  return function(dispatch) {
    return fetch(process.env.API_SERVER + '/api/tag/categories?active', {
      credentials: 'include',
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(setParentTags(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'parents error');
    });
  };
}

