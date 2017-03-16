export const SET_MESSAGES  = 'SET_MESSAGES';
export const NEW_MSG_SUCCESS = 'NEW_MSG_SUCCESS';
export const NEW_MSG_FAILURE = 'NEW_MSG_FAILURE';

import * as utils from '../utils';

var request = require('superagent');

export function getMessages(userID) {
  return function(dispatch) {
    request
    .get('/api/message?to=' + userID)
    .end(function(error, response){
      if (error || !response.ok) {
        console.log(error, 'error');
      } else {
        dispatch(setMessages(response.body));
      }
    })
  }
}

export function createMessage(token, messageObj) {
  if(!token) token = utils.auth.getToken();
  return function(dispatch) {
    request
    .post('/api/message?access_token=' + token)
    .send(messageObj)
    .end(function(error, response){
      console.log('api call sent')
      if (error || !response.ok) {
        console.log('dispatching error :(((')
        dispatch(msgFailure());
      } else {
        console.log('shld dispatch msg success now')
        dispatch(msgSuccess());
      }
    });
  }
}

function setMessages(messages) {
  return {
      type: "SET_MESSAGES",
      payload: messages
  };
}

function msgSuccess() {
  return {
    type: "NEW_MSG_SUCCESS",
    text: 'Message sent!'
  };
}

function msgFailure() {
  return {
    type: "NEW_MSG_FAILURE",
    text: 'Something went wrong. Please try again'
  };
}

export function handleErrors(response) {
  if (!response.ok) {
      console.log(response, 'error response')
      throw Error(response.statusText);
      return false;
  }
  return response;
}
