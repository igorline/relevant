import * as types from 'core/actionTypes';

const initialState = {
  // read: 1,
  discover: {},
  refresh: {}
  // post: 'url',
  // profile: 1
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    case types.REFRESH_ROUTE: {
      return {
        ...state,
        refresh: {
          ...state.refresh,
          [action.key]: new Date()
        }
      };
    }
    case types.SET_WEB_VIEW: {
      switch (action.payload.type) {
        case 'discover':
          return {
            ...state,
            discover: action.payload.params,
          };
        default:
          return state;
      }
    }
    case types.SET_VIEW: {
      switch (action.payload.type) {
        // case 'read':
        //   return Object.assign({}, state, {
        //     'read':  action.payload.view ? action.payload.view : state.read,
        //   })
        //   break;

        case 'discover':
          return {
            ...state,
            discover: {
              // ...state.discover,
              tab: action.payload.view,
            },
            // discover: {
            //   tab: action.payload.view
            // }
          };


        // case 'post':
        //   return Object.assign({}, state, {
        //     'post':  action.payload.view ? action.payload.view : state.post.view
        //   })
        //   break;

        // case 'profile':
        //   return Object.assign({}, state, {
        //     'profile':  action.payload.view ? action.payload.view : state.profile.view
        //   })
        //   break;

        case types.LOGOUT_USER: {
          return { ...initialState };
        }

        default:
          return state;
      }
    }

    default:
      return state;
  }
}
