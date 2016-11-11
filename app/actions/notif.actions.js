import * as types from './actionTypes';
import * as errorActions from './error.actions';
require('../publicenv');
// const apiServer = process.env.API_SERVER + '/api/';

export function setActivity(data, type, index) {
  return {
    type: types.SET_ACTIVITY,
    payload: {
      data,
      type,
      index
    }
  };
}

export function resetActivity(data) {
  return {
    type: 'RESET_ACTIVITY',
    payload: data
  };
}

export function clearCount() {
  return {
    type: 'CLEAR_COUNT'
  };
}

export function setCount(data) {
  return {
    type: types.SET_COUNT,
    payload: data
  };
}

export
function getActivity(userId, skip, reset) {
  let type = 'personal';
  return (dispatch) => {
    fetch(process.env.API_SERVER +
    '/api/notification?userId=' + userId +
    '&skip=' + skip, {
      credentials: 'include',
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
    })
    .then(response => response.json())
    .then((responseJSON) => {
      if (!reset) {
        dispatch(setActivity(responseJSON, type, skip));
      } else {
        dispatch(resetActivity(responseJSON));
      }
      dispatch(errorActions.setError('activity', false));
    })
    .catch((error) => {
      console.log('error', error);
      dispatch(errorActions.setError('activity', true, error.message));
    });
  };
}

export
function getGeneralActivity(userId, skip) {
  let type = 'general';
  return (dispatch) => {
    fetch(process.env.API_SERVER +
    '/api/notification/general?skip=' + skip +
    '&avoidUser=' + userId, {
      credentials: 'include',
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
    })
    .then(response => response.json())
    .then((responseJSON) => {
      dispatch(setActivity(responseJSON, type, skip));
      dispatch(errorActions.setError('activity', false));
    })
    .catch((error) => {
      console.log('error', error);
      dispatch(errorActions.setError('activity', true, error.message));
    });
  };
}

export
function markRead(token, userId) {
  return (dispatch) => {
    //console.log('mark read')
    fetch(process.env.API_SERVER+'/api/notification?access_token='+token+'&forUser='+userId, {
      credentials: 'include',
      method: 'PUT',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(clearCount());
      dispatch(getActivity(userId, 0, true));
    })
    .catch((error) => {
      console.log('error', error)
    });
  }
}

export
function createNotification(token, obj) {
  return function(dispatch) {
    fetch(process.env.API_SERVER+'/api/notification?access_token='+token, {
      credentials: 'include',
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
    .then((response) => response.json())
    .then((responseJSON) => {
      console.log('created notif')
    })
  }
}







