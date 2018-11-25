import * as utils from '../utils';
import * as errorActions from './error.actions';
import * as types from './actionTypes';

utils.api.env();

const getOptions = {
  credentials: 'include',
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
};

const AlertIOS = utils.api.Alert();

const queryParams = (params) => {
  return Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
};

export function updateLocalUser(user) {
  return {
    type: types.UPDATE_USER,
    payload: user
  };
}

export
function getUsersLoading() {
  return {
    type: 'GET_USER_LIST'
  };
}

export
function getUserLoading() {
  return {
    type: 'GET_USER_LOADING'
  };
}

export function setUserList(users, index, topic) {
  return {
    type: 'SET_USER_LIST',
    payload: {
      users,
      index,
      topic
    }
  };
}

export
function clearUserList() {
  return {
    type: 'CLEAR_USER_LIST'
  };
}

export
function clearSelectedUser() {
  return {
    type: 'CLEAR_SELECTED_USER',
  };
}

export
function setSelectedUserData(data) {
  return {
    type: types.SET_SELECTED_USER_DATA,
    payload: data
  };
}

export
function setUserSearch(data) {
  return {
    type: 'SET_USER_SEARCH',
    payload: data
  };
}

export function searchUser(userName) {
  let limit = 50;
  let url = process.env.API_SERVER +
    '/api/user/search' +
    '?limit=' + limit +
    '&search=' + userName;
  return async dispatch =>
    fetch(url, {
      method: 'GET',
      ...await utils.api.reqOptions()
    })
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(setUserSearch(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
      dispatch(errorActions.setError('activity', true, error.message));
    });
}

export function getSelectedUser(userName) {
  return async dispatch => {
    try {
      dispatch(getUserLoading());
      let user = await utils.api.request({
        method: 'GET',
        endpoint: 'user',
        path: '/user/' + userName,
      });
      dispatch(setSelectedUserData(user));
      dispatch(errorActions.setError('profile', false));
      return true;
    } catch (err) {
      dispatch(errorActions.setError('profile', true, err.message));
      return false;
    }
  };
}


export function getOnlineUser(userId) {
  return async dispatch => {
    return fetch(
      process.env.API_SERVER +
      '/api/user/user/' + userId, {
        method: 'GET',
        ...await utils.api.reqOptions()
      }
    )
    .then((response) => response.json())
    .then((responseJSON) => {
      return { status: true, data: responseJSON };
    })
    .catch((error) => {
      console.log(error, 'error');
      return { status: false, data: error };
    });
  };
}


export function getUsers(skip, limit, tags) {
  if (!skip) skip = 0;
  if (!limit) limit = 10;
  let topic = null;
  if (tags.length === 1) {
    topic = tags[0]._id || tags[0];
  }
  let url = process.env.API_SERVER +
    '/api/user/general/list?' + queryParams({ skip, limit, topic });
  return async dispatch => {
    dispatch(getUsersLoading());
    fetch(url, {
      method: 'GET',
      ...await utils.api.reqOptions()
    })
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(errorActions.setError('activity', false));
      dispatch(setUserList(responseJSON, skip, topic));
    })
    .catch((error) => {
      console.log(error, 'error');
      dispatch(errorActions.setError('activity', true, error.message));
    });
  };
}

export function updateBlock(block, unblock) {
  let url = process.env.API_SERVER + '/api/user/block';
  if (unblock) {
    url = process.env.API_SERVER + '/api/user/unblock';
  }
  return async dispatch =>
    fetch(url, {
      method: 'PUT',
      body: JSON.stringify({
        block
      }),
      ...await utils.api.reqOptions()
    })
    .then(utils.api.handleErrors)
    .then(response => response.json())
    .then((responseJSON) => {
      let action = 'blocked';
      if (unblock) action = 'unblocked';
      AlertIOS.alert('user ' + block + ' has been ' + action);
      // console.log('block result ', responseJSON);
      dispatch(updateLocalUser(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
}

export function getBlocked() {
  return async dispatch =>
    fetch(process.env.API_SERVER + '/api/user/blocked', {
      method: 'GET',
      ...await utils.api.reqOptions()
    })
    .then(utils.api.handleErrors)
    .then(response => response.json())
    .then((responseJSON) => {
      console.log('block result ', responseJSON);
      dispatch(updateLocalUser(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
}
