import { api, alert } from 'app/utils';
import * as errorActions from 'modules/ui/error.actions';
import * as types from 'core/actionTypes';

const Alert = alert.Alert();

const queryParams = params =>
  Object.keys(params)
  .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
  .join('&');

export function updateLocalUser(user) {
  return {
    type: types.UPDATE_USER,
    payload: user
  };
}

export function getUsersLoading() {
  return {
    type: 'GET_USER_LIST'
  };
}

export function getUserLoading() {
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

export function clearUserList() {
  return {
    type: 'CLEAR_USER_LIST'
  };
}

export function clearSelectedUser() {
  return {
    type: 'CLEAR_SELECTED_USER'
  };
}

export function setSelectedUserData(data) {
  return {
    type: types.SET_SELECTED_USER_DATA,
    payload: data
  };
}

export function setUserSearch(data) {
  return {
    type: 'SET_USER_SEARCH',
    payload: data
  };
}

export function searchUser(userName) {
  const limit = 50;
  return async dispatch => {
    try {
      const res = await api.request({
        method: 'GET',
        endpoint: 'user',
        path: '/search',
        query: { limit, search: userName }
      });
      dispatch(setUserSearch(res));
      return res;
    } catch (err) {
      dispatch(errorActions.setError('activity', true, err.message));
      return false;
    }
  };
}

export function getSelectedUser(userName) {
  return async dispatch => {
    try {
      dispatch(getUserLoading());
      const user = await api.request({
        method: 'GET',
        endpoint: 'user',
        path: '/user/' + userName
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
  return async () =>
    fetch(process.env.API_SERVER + '/api/user/user/' + userId, {
      method: 'GET',
      ...(await api.reqOptions())
    })
    .then(response => response.json())
    .then(responseJSON => ({ status: true, data: responseJSON }))
    .catch(error => ({ status: false, data: error }));
}

export function getUsers(skip, limit, tags) {
  if (!skip) skip = 0;
  if (!limit) limit = 10;
  let topic = null;
  if (tags.length === 1) {
    topic = tags[0]._id || tags[0];
  }
  const url =
    process.env.API_SERVER +
    '/api/user/general/list?' +
    queryParams({ skip, limit, topic });

  return async dispatch => {
    dispatch(getUsersLoading());
    fetch(url, {
      method: 'GET',
      ...(await api.reqOptions())
    })
    .then(response => response.json())
    .then(responseJSON => {
      dispatch(errorActions.setError('activity', false));
      dispatch(setUserList(responseJSON, skip, topic));
    })
    .catch(error => {
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
      ...(await api.reqOptions())
    })
    .then(api.handleErrors)
    .then(response => response.json())
    .then(responseJSON => {
      let action = 'blocked';
      if (unblock) action = 'unblocked';
      Alert.alert('user ' + block + ' has been ' + action);
      // console.log('block result ', responseJSON);
      dispatch(updateLocalUser(responseJSON));
    })
    .catch(null);
}

export function getBlocked() {
  return async dispatch =>
    fetch(process.env.API_SERVER + '/api/user/blocked', {
      method: 'GET',
      ...(await api.reqOptions())
    })
    .then(api.handleErrors)
    .then(response => response.json())
    .then(responseJSON => {
      dispatch(updateLocalUser(responseJSON));
    })
    .catch(null);
}
