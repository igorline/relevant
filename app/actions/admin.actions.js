import { normalize, schema } from 'normalizr';
import * as types from './actionTypes';
import * as utils from '../utils';

let AlertIOS = utils.fetchUtils.Alert();
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

export function getInvites() {
  return async (dispatch) => {
    fetch(API + '/invites', {
      method: 'GET',
      ...await utils.fetchUtils.reqOptions()
    })
    .then(utils.fetchUtils.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      let data = normalize(
        { invites: responseJSON },
        { invites: [inviteSchema] }
      );
      dispatch(setInvites(data));
    })
    .catch((error) => {
      console.log('invites error', error);
    });
  };
}

export function createInvite(invite) {
  return async (dispatch) =>
    fetch(API + '/invites', {
      method: 'POST',
      ...await utils.fetchUtils.reqOptions(),
      body: JSON.stringify(invite)
    })
    .then(utils.fetchUtils.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(updateInvite(responseJSON));
      return responseJSON;
    })
    .catch((error) => {
      console.log('invites error', error);
      return false;
    });
}

export function sendInvitationEmail(id) {
  return async (dispatch) =>
    fetch(API + '/invites/email', {
      method: 'POST',
      ...await utils.fetchUtils.reqOptions(),
      body: JSON.stringify({ inviteId: id })
    })
    .then(utils.fetchUtils.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(updateInvite(responseJSON));
      AlertIOS.alert('Invitation email has been sent');
    })
    .catch((error) => {
      console.log('invites error', error);
    });
}

export function checkInviteCode(code) {
  return async dispatch =>
    fetch(API + '/invites', {
      method: 'PUT',
      ...await utils.fetchUtils.reqOptions(),
      body: JSON.stringify({ code })
    })
    .then(utils.fetchUtils.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(updateInvite(responseJSON));
      if (responseJSON) return responseJSON;
      return false;
    })
    .catch((error) => {
      AlertIOS.alert(error.message);
      console.log('invites error', error);
    });
}

export function destroy(invite) {
  return async dispatch =>
    fetch(API + '/invites/' + invite._id, {
      method: 'DELETE',
      ...await utils.fetchUtils.reqOptions(),
    })
    .then(utils.fetchUtils.handleErrors)
    .then(() => {
      AlertIOS.alert('removed item');
      dispatch(destroyInvite(invite));
    })
    .catch((error) => {
      AlertIOS.alert(error.message);
      console.log('invites error', error);
    });
}

export function getWaitlist() {
  return async dispatch =>
    fetch(API + '/list', {
      method: 'GET',
      ...await utils.fetchUtils.reqOptions()
    })
    .then(utils.fetchUtils.handleErrors)
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
      ...await utils.fetchUtils.reqOptions(),
      body: JSON.stringify(user)
    })
    .then(utils.fetchUtils.handleErrors)
    // .then(response => response.json())
    .then(() => {
      AlertIOS.alert('Your email has been added to the waitlist');
      return true;
    })
    .catch(err => {
      AlertIOS.alert(err.message);
      console.log(err);
      return false;
    });
}

// export function updateWaitlist(user) {
//   return async dispatch =>
//   fetch(API + '/list/' + user._id, {
//     method: 'PUT',
//     ...await utils.fetchUtils.reqOptions(),
//     body: JSON.stringify({ user })
//   })
//   .then(utils.fetchUtils.handleErrors)
//   .then((response) => response.json())
//   .then((responseJSON) => {
//     dispatch(updateWaitlist(responseJSON));
//     if (responseJSON) return responseJSON;
//     return false;
//   })
//   .catch((error) => {
//     AlertIOS.alert(error.message);
//     console.log('invites error', error);
//   });
// }
