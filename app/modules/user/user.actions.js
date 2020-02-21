import { api, alert } from 'app/utils';
import * as errorActions from 'modules/ui/error.actions';
import * as types from 'core/actionTypes';

const Alert = alert.Alert();

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
      const res = await dispatch(
        api.request({
          method: 'GET',
          endpoint: 'user',
          path: '/search',
          query: { limit, search: userName }
        })
      );
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
      const user = await dispatch(
        api.request({
          method: 'GET',
          endpoint: 'user',
          path: '/user/' + userName
        })
      );
      dispatch(setSelectedUserData(user));
      dispatch(errorActions.setError('profile', false));
      return true;
    } catch (err) {
      dispatch(errorActions.setError('profile', true, err.message));
      return false;
    }
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
