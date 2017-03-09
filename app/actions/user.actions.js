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


const queryParams = (params) => {
  return Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
};


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
    dispatch(getUserLoading());
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

export function getUsers(skip, limit, tags) {
  if (!skip) skip = 0;
  if (!limit) limit = 10;
  let topic = null;
  if (tags.length === 1) {
    topic = tags[0]._id;
  }
  let url = process.env.API_SERVER +
    '/api/user/general/list?' + queryParams({ skip, limit, topic });
  return (dispatch) => {
    dispatch(getUsersLoading());
    fetch(url, getOptions)
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
