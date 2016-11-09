import * as utils from '../utils';
import * as errorActions from './error.actions';

require('../publicenv');

const getOptions = {
  credentials: 'include',
  method: 'GET',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
};

export
function getUsersLoading() {
  return {
    type: 'GET_USER_LIST'
  };
}

export function setUserList(users, index) {
  return {
    type: 'SET_USER_LIST',
    payload: {
      users,
      index
    }
  };
}

export
function clearUserList() {
  return {
    type: 'CLEAR_USER_LIST'
  };
}

// export
// function setSelectedUser(user) {
//   return {
//     type: 'SET_SELECTED_USER',
//     payload: user
//   };
// }

export
function clearSelectedUser() {
  return {
    type: 'CLEAR_SELECTED_USER',
  };
}

export
function setSelectedUserData(data) {
  return {
    type: 'SET_SELECTED_USER_DATA',
    payload: data
  };
}


export
function getSelectedUser(userId) {
  return (dispatch) => {
    // dispatch(setSelectedUser(userId));
    // test network error handling
    // return fetch('10.66.77.88.1/api/user/' + userId,
    return fetch(process.env.API_SERVER + '/api/user/' + userId,
      {
        credentials: 'include',
        method: 'GET',
        timeout: 0.00001,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then((responseJSON) => {
        dispatch(setSelectedUserData(responseJSON));
        dispatch(errorActions.setError(false));
        return true;
      })
      .catch((error) => {
        console.log(error, 'error');
        dispatch(errorActions.setError(true, error.message));
      });
  };
}

export
function getOnlineUser(userId, token) {
  return (dispatch) => {
    return fetch(
      process.env.API_SERVER +
      '/api/user/' +userId +
      '?access_token=' + token,
      getOptions
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

export
function getPostUser(userId, token) {
  return (dispatch) => {
    return fetch(
      process.env.API_SERVER +
      '/api/user/' + userId +
      '?access_token=' + token,
      getOptions
    )
    .then(utils.fetchError.handleErrors)
    .then(response => response.json())
    .then((responseJSON) => {
      return responseJSON;
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  };
}

export function getUsers(skip, limit) {
  if (!skip) skip = 0;
  if (!limit) limit = 10;
  let url = process.env.API_SERVER +
    '/api/user/general/list'
    + '?skip=' + skip +
    '&limit=' + limit;
  return (dispatch) => {
    dispatch(getUsersLoading());
    fetch(url, getOptions)
    .then(response => response.json())
    .then((responseJSON) => {
      // console.log(responseJSON, 'get users')
      dispatch(setUserList(responseJSON, skip));
    })
    .catch((error) => {
      console.log(error, 'error');
    });
  };
}
