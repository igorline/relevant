import { normalize, schema } from 'normalizr';
import * as types from './actionTypes';
import * as utils from '../utils';

let Alert = utils.api.Alert();
const API = process.env.API_SERVER + '/api';
const DEFAULT_LIMIT = 20;

const inviteSchema = new schema.Entity('invites',
  {},
  { idAttribute: '_id' }
);

const listSchema = new schema.Entity('wait',
  {},
  { idAttribute: '_id' }
);

export function setInvites(data) {
  return {
    type: types.SET_INVITES,
    payload: data,
  };
}

export function setWaitlist(data) {
  return {
    type: types.SET_WAITLIST,
    payload: data
  };
}

export function updateInvite(invite) {
  return {
    type: types.UPDATE_INVITE,
    payload: invite
  };
}

export function destroyInvite(invite) {
  return {
    type: types.DESTROY_INVITE,
    payload: invite
  };
}

export function getInvites(skip, limit) {
  return async dispatch => {
    try {
      let responseJSON = await utils.api.request({
        method: 'GET',
        query: { skip, limit },
        endpoint: 'invites',
        path: '',
      });
      let data = normalize(
        { invites: responseJSON },
        { invites: [inviteSchema] }
      );
      dispatch(setInvites(data));
      return true;
    } catch (error) {
      return false;
    }
  };
}

export function createInvite(invite) {
  return async (dispatch) =>
    fetch(API + '/invites', {
      method: 'POST',
      ...await utils.api.reqOptions(),
      body: JSON.stringify(invite)
    })
    .then(utils.api.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(updateInvite(responseJSON));
      Alert.alert('Invitation email has been sent');
      return responseJSON;
    })
    .catch((error) => {
      console.log('invites error', error);
      Alert.alert(error.message);
      return false;
    });
}

export function sendInvitationEmail(id) {
  return async (dispatch) =>
    fetch(API + '/invites/email', {
      method: 'POST',
      ...await utils.api.reqOptions(),
      body: JSON.stringify({ inviteId: id })
    })
    .then(utils.api.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(updateInvite(responseJSON));
      Alert.alert('Invitation email has been sent');
    })
    .catch((error) => {
      console.log('invites error', error);
    });
}

export function checkInviteCode(code) {
  return async dispatch =>
    fetch(API + '/invites', {
      method: 'PUT',
      ...await utils.api.reqOptions(),
      body: JSON.stringify({ code })
    })
    .then(utils.api.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(updateInvite(responseJSON));
      if (responseJSON) return responseJSON;
      return false;
    })
    .catch((error) => {
      Alert.alert(error.message);
      console.log('invites error', error);
    });
}

export function destroy(invite) {
  return async dispatch =>
    fetch(API + '/invites/' + invite._id, {
      method: 'DELETE',
      ...await utils.api.reqOptions(),
    })
    .then(utils.api.handleErrors)
    .then(() => {
      Alert.alert('removed item');
      dispatch(destroyInvite(invite));
    })
    .catch((error) => {
      Alert.alert(error.message);
      console.log('invites error', error);
    });
}

export function getWaitlist() {
  return async dispatch =>
    fetch(API + '/list', {
      method: 'GET',
      ...await utils.api.reqOptions()
    })
    .then(utils.api.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      let data = normalize(
        { wait: responseJSON },
        { wait: [listSchema] }
      );
      dispatch(setWaitlist(data));
    })
    .catch((error) => {
      console.log('invites error', error);
    });
}

export function signupForMailingList(user) {
  return async dispatch =>
    fetch(process.env.API_SERVER + '/api/list/', {
      method: 'POST',
      ...await utils.api.reqOptions(),
      body: JSON.stringify(user)
    })
    .then(utils.api.handleErrors)
    // .then(response => response.json())
    .then(() => {
      Alert.alert('Your email has been added to the waitlist');
      return true;
    })
    .catch(err => {
      Alert.alert(err.message);
      console.log(err);
      return false;
    });
}

export function setDownvotes(data) {
  return {
    type: types.SET_DOWNVOTES,
    payload: data,
  };
}

export function getDownvotes(skip, limit) {
  return dispatch =>
    utils.api.request({
      method: 'GET',
      query: { skip, limit },
      endpoint: 'invest',
      path: '/downvotes',
    })
    .then(res => dispatch(setDownvotes(res)))
    .catch(err => Alert.alert(err.message));
}

export function sendEmail(email) {
  return async dispatch => {
    try {
      await utils.api.request({
        method: 'PUT',
        endpoint: 'email',
        path: '/',
        body: JSON.stringify(email)
      });
      Alert.alert('Email has been sent');
      return true;
    } catch (error) {
      return false;
    }
  };
}

export function saveEmail(email) {
  return async dispatch => {
    try {
      await utils.api.request({
        method: 'PUT',
        endpoint: 'email',
        path: '/save',
        body: JSON.stringify(email)
      });
      Alert.alert('Email has been saved');
      return true;
    } catch (error) {
      return false;
    }
  };
}

export function loadEmail() {
  return async dispatch => {
    try {
      let responseJSON = await utils.api.request({
        method: 'GET',
        endpoint: 'email',
        path: '/load',
      });
      return responseJSON;
    } catch (error) {
      return false;
    }
  };
}

// export function updateWaitlist(user) {
//   return async dispatch =>
//   fetch(API + '/list/' + user._id, {
//     method: 'PUT',
//     ...await utils.api.reqOptions(),
//     body: JSON.stringify({ user })
//   })
//   .then(utils.api.handleErrors)
//   .then((response) => response.json())
//   .then((responseJSON) => {
//     dispatch(updateWaitlist(responseJSON));
//     if (responseJSON) return responseJSON;
//     return false;
//   })
//   .catch((error) => {
//     Alert.alert(error.message);
//     console.log('invites error', error);
//   });
// }
