import * as types from './actionTypes';
require('../publicenv');
var { Actions } = require('react-native-redux-router');
import * as utils from '../utils';

export function getDiscoverTags() {
  return function(dispatch) {
    fetch(process.env.API_SERVER+'/api/tag?sort=count', {
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
      dispatch(setDiscoverTags(responseJSON));
    })
    .catch((error) => {
        console.log(error, 'error');
    });
  }
}


export function setDiscoverTags(data) {
    return {
        type: types.SET_DISCOVER_TAGS,
        payload: data
    };
}

export function goToTag(tag) {
  return function(dispatch) {
    console.log('go to', tag)
    dispatch(setTag(tag));
    // dispatch(Actions.Discover);
  }
}

export function setTag(tag) {
    return {
        type: 'SET_TAG',
        payload: tag
    };
}

export function searchTags(tag) {
    return function(dispatch) {
    return fetch(process.env.API_SERVER+'/api/tag/search/'+tag, {
      credentials: 'include',
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      return {'status': true, 'data': responseJSON}
    })
    .catch((error) => {
      return {'status': false, 'data': error};
    });
  }
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
    }
}

export function getParentTags() {
  return function(dispatch) {
    return fetch(process.env.API_SERVER+'/api/tagparent', {
      credentials: 'include',
      method: 'GET',
      headers: {
          'Accept': 'application/json',
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
  }
}

export function setParentTags(data) {
    return {
        type: types.SET_PARENT_TAGS,
        payload: data
    };
}



