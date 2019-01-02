import * as types from 'core/actionTypes';

const initialState = {
  inviteList: [],
  invites: {},
  waitList: [],
  wait: {},
  currentInvite: null,
  downvotes: []
};

export default function admin(state = initialState, action) {
  switch (action.type) {
    case types.DESTROY_INVITE: {
      const invites = { ...state.invites };
      delete invites[action.payload._id];
      return {
        ...state,
        invites
      };
    }

    case types.DELETE_WAITLIST_USER: {
      const users = {};
      action.payload.forEach(u => (users[u._id] = null));
      const waitList = state.waitList.filter(u => users[u] !== null);
      return {
        ...state,
        wait: {
          ...state.wait,
          ...users
        },
        waitList
      };
    }

    case types.SET_WAITLIST: {
      return {
        ...state,
        waitList: [...action.payload.result.wait, ...state.waitList],
        wait: {
          ...state.wait,
          ...action.payload.entities.wait
        }
      };
    }

    case types.SET_INVITES: {
      return {
        ...state,
        inviteList: [...state.inviteList, ...action.payload.result.invites],
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
        inviteList: [...new Set([action.payload._id, ...state.inviteList])],
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
        downvotes: [...state.downvotes, ...action.payload]
      };
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
