import * as types from '../actions/actionTypes';

const initialState = {
  inviteList: [],
  invites: {},
  currentInvite: null,
};

export default function admin(state = initialState, action) {
  switch (action.type) {

    case types.DESTROY_INVITE: {
      let invites = { ...state.invites };
      delete invites[action.payload._id];
      return {
        ...state,
        invites
      };
    }

    case types.SET_INVITES: {
      return {
        ...state,
        inviteList: [
          ...state.inviteList,
          ...action.payload.result.invites
        ],
        invites: {
          ...state.invites,
          ...action.payload.entities.invites
        }
      };
    }

    case types.UPDATE_INVITE: {
      if (action.payload === null) {
        return {
          ...state,
          currentInvite: null
        };
      }
      return {
        ...state,
        currentInvite: action.payload,
        inviteList: [
          ...new Set([...state.inviteList, action.payload._id])
        ],
        invites: {
          ...state.invites,
          [action.payload._id]: {
            ...state.invites[action.payload._id],
            ...action.payload
          }
        }
      };
    }

    default:
      return state;
  }
}
