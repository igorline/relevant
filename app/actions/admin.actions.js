import { normalize, schema } from 'normalizr';
import * as types from './actionTypes';
import * as utils from '../utils';

let AlertIOS = utils.fetchUtils.Alert();
const API = process.env.API_SERVER + '/api/invites/';

const inviteSchema = new schema.Entity('invites',
  {},
  { idAttribute: '_id' }
);

export function setInvites(data) {
  return {
    type: types.SET_INVITES,
    payload: data,
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
    fetch(API, {
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
  return async (dispatch) => {
    fetch(API, {
      method: 'POST',
      ...await utils.fetchUtils.reqOptions(),
      body: JSON.stringify(invite)
    })
    .then(utils.fetchUtils.handleErrors)
    .then((response) => response.json())
    .then((responseJSON) => {
      dispatch(updateInvite(responseJSON));
    })
    .catch((error) => {
      console.log('invites error', error);
    });
  };
}

export function sendInvitationEmail(id) {
  return async (dispatch) =>
    fetch(API + 'email', {
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
    fetch(API, {
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
    fetch(API + invite._id, {
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
