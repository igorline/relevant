import * as types from '../actions/actionTypes';

const initialState = {
  error: false,
  users: {},
  list: [],
  listByTopic: {},
  online: [],
  loading: false,
  garbage: [],
  search: []
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case types.SET_USER_SEARCH: {
      return {
        ...state,
        search: action.payload.length ? action.payload : initialState.search
      };
    }

    case types.SET_USERS: {
      const users = {};
      if (!action.payload) return state;
      Object.keys(action.payload).forEach(id => {
        users[id] = { ...state.users[id], ...action.payload[id] };
      });
      return {
        ...state,
        users: {
          ...state.users,
          ...users
        }
      };
    }

    case 'SET_SELECTED_USER_DATA': {
      return {
        ...state,
        users: {
          ...state.users,
          [action.payload._id]: {
            ...state.users[action.payload._id],
            ...action.payload
          }
        }
      };
    }

    case 'GET_USER_LIST': {
      return Object.assign({}, state, {
        loading: true
      });
    }

    case 'SET_USER_LIST': {
      const topic = action.payload.topic || 'all';
      const currentList = state.list[topic] || [];
      return {
        ...state,
        list: {
          ...state.list,
          [topic]: [...currentList.slice(0, action.payload.index), ...action.payload.users]
        },
        loading: false
      };
    }

    case types.UPDATE_USER: {
      const id = action.payload._id;
      // prevents legacy relevance field overwrites
      // TODO should normalize this and store separately
      let relevance = action.payload.relevance;
      if ((!relevance || relevance.pagerank === undefined) && state.users[id]) {
        relevance = state.users[id].relevance;
      }
      return {
        ...state,
        users: {
          ...state.users,
          [action.payload._id]: {
            ...state.users[action.payload._id],
            ...action.payload,
            relevance
          }
        }
      };
    }

    case 'CLEAR_USER_LIST': {
      return Object.assign({}, state, {
        list: []
      });
    }

    // case types.LOGOUT_USER: {
    //   return { ...initialState };
    // }

    default:
      return state;
  }
}
