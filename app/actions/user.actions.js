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

export function setUserList(users, index, filter) {
  return {
    type: 'SET_USER_LIST',
    payload: {
      users,
      index,
      filter
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
    type: 'SET_SELECTED_USER_DATA',
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
  return (dispatch) => {
    fetch(url, getOptions)
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(setUserSearch(responseJSON));
    })
    .catch((error) => {
      console.log(error, 'error');
      dispatch(errorActions.setError('activity', true, error.message));
    });
  };
}

export
function getSelectedUser(userName) {
  return (dispatch) => {
    // dispatch(setSelectedUser(userId));
    // test network error handling
    // return fetch('10.255.255.1/api/user/' + userId,
    return fetch(process.env.API_SERVER + '/api/user/' + userName,
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
        dispatch(errorActions.setError('profile', false));
        return true;
      })
      .catch((error) => {
        console.log(error, 'error');
        dispatch(errorActions.setError('profile', true, error.message));
      });
  };
}

// export
// function getOnlineUsers(userArray, token) {
//   return (dispatch) => {
//     return fetch(
//       process.env.API_SERVER +
//       '/api/user/mulitiple' + userId +
//       '?access_token=' + token,
//       getOptions
//     )
//     .then((response) => response.json())
//     .then((responseJSON) => {
//       return { status: true, data: responseJSON };
//     })
//     .catch((error) => {
//       console.log(error, 'error');
//       return { status: false, data: error };
//     });
//   };
// }

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

export function getUsers(skip, limit, filter) {
  if (!skip) skip = 0;
  if (!limit) limit = 10;
  let url = process.env.API_SERVER +
    '/api/user/general/list' +
    '?skip=' + skip +
    '&limit=' + limit +
    '&filter=' + filter;
  return (dispatch) => {
    dispatch(getUsersLoading());
    fetch(url, getOptions)
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(errorActions.setError('activity', false));
      dispatch(setUserList(responseJSON, skip, filter));
    })
    .catch((error) => {
      console.log(error, 'error');
      dispatch(errorActions.setError('activity', true, error.message));
    });
  };
}
