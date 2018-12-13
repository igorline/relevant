/* eslint-disable no-console */
import * as types from './actionTypes';
import * as utils from '../utils';

utils.api.env();

export function setMessages(messages) {
  return {
    type: types.SET_MESSAGES,
    payload: messages
  };
}

export function setMessagesCount(number) {
  return {
    type: 'SET_MESSAGES_COUNT',
    payload: number
  };
}

export function getMessages(userId) {
  return dispatch => {
    fetch(process.env.API_SERVER + '/api/message?to=' + userId, {
      credentials: 'include',
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(responseJSON => {
      dispatch(setMessages(responseJSON));
    })
    .catch(error => {
      console.log(error, 'error');
    });
  };
}

export function createMessage(token, obj) {
  return () =>
    fetch(process.env.API_SERVER + '/api/message?access_token=' + token, {
      credentials: 'include',
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
    .then(response => response.json())
    .then(responseJSON => ({ status: true, data: responseJSON }))
    .catch(error => ({ status: false, data: error }));
}
