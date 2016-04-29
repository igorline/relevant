import * as types from './actionTypes';
require('../publicenv');
var { Actions } = require('react-native-redux-router');
import * as utils from '../utils';

export function searchTags(tag) {
    return function(dispatch) {
  var searchObj = {'search':{}};
  searchObj.search['name'] = tag;
    return fetch(process.env.API_SERVER+'/api/tag', {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchObj)
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

export function searchSpecific(tag) {
    return function(dispatch) {
  var searchObj = {'search':{}};
  searchObj.search['name'] = tag;
    return fetch(process.env.API_SERVER+'/api/tag/specific', {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchObj)
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


export function createParentTag(token) {
    return function(dispatch) {
      return fetch(process.env.API_SERVER+'/api/tagparent/create?access_token='+token, {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
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

export function createTag(token, tagObj) {
    return function(dispatch) {
      return fetch(process.env.API_SERVER+'/api/tag/create?access_token='+token, {
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
      console.log(responseJSON, 'parents json');
      return {'status': true, 'data': responseJSON}
    })
    .catch((error) => {
      console.log(error, 'parents error');
      return {'status': false, 'data': error};
    });
  }
}
