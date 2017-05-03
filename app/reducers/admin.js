import * as types from '../actions/actionTypes';

const initialState = {
  inviteList: [],
  invites: {},
  waitList: [],
  wait: {},
  currentInvite: null,
  downvotes: [],
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

    case types.SET_WAITLIST: {
      return {
        ...state,
        waitList: [
          ...action.payload.result.wait,
          ...state.waitList,
        ],
        wait: {
          ...state.wait,
          ...action.payload.entities.wait
        }
      };
    }

    case types.SET_INVITES: {
      return {
        ...state,
        inviteList: [
          ...state.inviteList,
          ...action.payload.result.invites,
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
          ...new Set([action.payload._id, ...state.inviteList])
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

    case types.SET_DOWNVOTES: {
      return {
        ...state,
        downvotes: [
          ...state.downvotes,
          ...action.payload,
        ],
      };
    }

    default:
      return state;
  }
}

