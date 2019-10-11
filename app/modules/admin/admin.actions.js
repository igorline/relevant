/* eslint-disable no-console */
import { normalize, schema } from 'normalizr';
import * as types from 'core/actionTypes';
import { alert, api } from 'app/utils';

const Alert = alert.Alert();
const API = process.env.API_SERVER + '/api';

const inviteSchema = new schema.Entity(
  'invites',
  {},
  {
    idAttribute: '_id'
  }
);

const listSchema = new schema.Entity(
  'wait',
  {},
  {
    idAttribute: '_id'
  }
);

export function setInvites({ data, community, skip }) {
  return {
    type: types.SET_INVITES,
    payload: {
      data,
      community,
      skip
    }
  };
}

export function setWaitlist(data) {
  return {
    type: types.SET_WAITLIST,
    payload: data
  };
}

export function deleteWaitlistUsers(users) {
  return {
    type: types.DELETE_WAITLIST_USER,
    payload: users
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

export function setInviteCount(count) {
  return {
    type: types.SET_INVITE_COUNT,
    payload: count
  };
}

export function getInviteCount() {
  return async dispatch => {
    try {
      const count = await dispatch(
        api.request({
          method: 'GET',
          endpoint: 'invites',
          path: '/count'
        })
      );

      dispatch(setInviteCount(count));
    } catch (err) {
      Alert.alert(err.message);
    }
  };
}

export function getInvites(skip, limit, community) {
  return async dispatch => {
    try {
      const responseJSON = await dispatch(
        api.request({
          method: 'GET',
          query: { skip, limit },
          endpoint: 'invites',
          path: ''
        })
      );
      const data = normalize(
        {
          invites: responseJSON
        },
        {
          invites: [inviteSchema]
        }
      );
      dispatch(setInvites({ data, community, skip }));
      return true;
    } catch (error) {
      return false;
    }
  };
}

export function createInvite(invite) {
  return async dispatch => {
    try {
      const res = await dispatch(
        api.request({
          method: 'POST',
          endpoint: 'invites',
          path: '/',
          body: JSON.stringify(invite)
        })
      );
      dispatch(updateInvite(res.invite[0]));
      dispatch(setInviteCount(res.count));
      return res;
    } catch (error) {
      Alert.alert(error.message);
      return false;
    }
  };
}

// export function sendInvitationEmail(id) {
//   return async dispatch =>
//     fetch(API + '/invites/email', {
//       method: 'POST',
//       ...(await api.reqOptions()),
//       body: JSON.stringify({
//         inviteId: id
//       })
//     })
//     .then(api.handleErrors)
//     .then(response => response.json())
//     .then(responseJSON => {
//       dispatch(updateInvite(responseJSON));
//       Alert.alert('Invitation email has been sent');
//     })
//     .catch(error => {
//       console.log('invites error', error);
//     });
// }

// export function checkInviteCode(code) {
//   return async dispatch =>
//     fetch(API + '/invites', {
//       method: 'PUT',
//       ...(await api.reqOptions()),
//       body: JSON.stringify({
//         code
//       })
//     })
//     .then(api.handleErrors)
//     .then(response => response.json())
//     .then(responseJSON => {
//       dispatch(updateInvite(responseJSON));
//       if (responseJSON) return responseJSON;
//       return false;
//     })
//     .catch(error => {
//       Alert.alert(error.message);
//       console.log('invites error', error);
//     });
// }

export function destroy(invite) {
  return async dispatch =>
    fetch(API + '/invites/' + invite._id, {
      method: 'DELETE',
      ...(await api.reqOptions())
    })
      .then(api.handleErrors)
      .then(() => {
        Alert.alert('removed item');
        dispatch(destroyInvite(invite));
      })
      .catch(error => {
        Alert.alert(error.message);
        console.log('invites error', error);
      });
}

export function getWaitlist() {
  return async dispatch =>
    fetch(API + '/list', {
      method: 'GET',
      ...(await api.reqOptions())
    })
      .then(api.handleErrors)
      .then(response => response.json())
      .then(responseJSON => {
        const data = normalize(
          {
            wait: responseJSON
          },
          {
            wait: [listSchema]
          }
        );
        dispatch(setWaitlist(data));
      })
      .catch(error => {
        console.log('invites error', error);
      });
}

export function inviteFromWaitlist(invites) {
  return async dispatch =>
    fetch(process.env.API_SERVER + '/api/list/', {
      method: 'PUT',
      ...(await api.reqOptions()),
      body: JSON.stringify(invites)
    })
      .then(api.handleErrors)
      // .then(response => response.json())
      .then(() => {
        Alert.alert('users have been invited!');
        dispatch(deleteWaitlistUsers(invites));
        return true;
      })
      .catch(err => {
        Alert.alert(err.message);
        console.log(err);
        return false;
      });
}

export function signupForMailingList(user) {
  return async () =>
    fetch(process.env.API_SERVER + '/api/list/', {
      method: 'POST',
      ...(await api.reqOptions()),
      body: JSON.stringify(user)
    })
      .then(api.handleErrors)
      .then(() => {
        Alert.alert("You've been added to the waitlist.", 'success');
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
    payload: data
  };
}

export function getDownvotes(skip, limit) {
  return dispatch =>
    dispatch(
      api.request({
        method: 'GET',
        query: {
          skip,
          limit
        },
        endpoint: 'invest',
        path: '/downvotes'
      })
    )
      .then(res => dispatch(setDownvotes(res)))
      .catch(err => Alert.alert(err.message));
}

export function sendEmail(email) {
  return async dispatch => {
    try {
      await dispatch(
        api.request({
          method: 'PUT',
          endpoint: 'email',
          path: '/',
          body: JSON.stringify(email)
        })
      );
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
      await dispatch(
        api.request({
          method: 'PUT',
          endpoint: 'email',
          path: '/save',
          body: JSON.stringify(email)
        })
      );
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
      const responseJSON = await dispatch(
        api.request({
          method: 'GET',
          endpoint: 'email',
          path: '/load'
        })
      );
      return responseJSON;
    } catch (error) {
      return false;
    }
  };
}

export function deleteWaitlistUser(user) {
  return async dispatch => {
    try {
      const result = await fetch(API + '/list/' + user._id, {
        method: 'DELETE',
        ...(await api.reqOptions())
      });
      // console.log(result)
      if (result) {
        dispatch(deleteWaitlistUsers([user]));
      }
    } catch (err) {
      Alert.alert(err.message);
    }
  };
}

export function sendPostNotification(post) {
  return async dispatch => {
    try {
      await dispatch(
        api.request({
          method: 'POST',
          endpoint: 'post',
          path: '/sendPostNotification',
          body: JSON.stringify(post)
        })
      );
      return Alert.alert('Notification sent!');
    } catch (error) {
      return false;
    }
  };
}

// export function updateWaitlist(user) {
//   return async dispatch =>
//   fetch(API + '/list/' + user._id, {
//     method: 'PUT',
//     ...await api.reqOptions(),
//     body: JSON.stringify({ user })
//   })
//   .then(api.handleErrors)
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
