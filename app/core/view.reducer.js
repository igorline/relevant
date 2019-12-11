import * as types from 'core/actionTypes';

const initialState = {
  discover: {},
  refresh: {}
};

export default function auth(state = initialState, action) {
  switch (action.type) {
    // case types.REFRESH_ROUTE: {
    //   return {
    //     ...state,
    //     refresh: {
    //       ...state.refresh,
    //       [action.key]: new Date()
    //     }
    //   };
    // }
    case types.SET_WEB_VIEW: {
      switch (action.payload.type) {
        case 'discover':
          return {
            ...state,
            discover: action.payload.params
          };
        default:
          return state;
      }
    }
    // case types.SET_VIEW: {
    //   switch (action.payload.type) {
    //     case 'discover':
    //       return {
    //         ...state,
    //         discover: {
    //           tab: action.payload.view
    //         }
    //       };
    //     default:
    //       return state;
    //   }
    // }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
