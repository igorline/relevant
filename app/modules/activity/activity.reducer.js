import * as types from 'core/actionTypes';

const initialState = {
  personal: [],
  count: 0,
  loaded: false,
  general: [],
  promptType: null,
  promptProps: {}
};

export default function notifications(state = initialState, action) {
  switch (action.type) {
    case types.SET_ACTIVITY: {
      const { type } = action.payload;
      return {
        ...state,
        [type]: [...state[type].slice(0, action.payload.index), ...action.payload.data],
        loaded: true
      };
    }

    case types.SET_COUNT: {
      return {
        ...state,
        count: action.payload
      };
    }

    case 'CLEAR_COUNT': {
      return {
        ...state,
        count: 0
      };
    }

    case 'ADD_ACTIVITY': {
      return {
        ...state,
        count: state.count + 1
      };
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    case types.SHOW_BANNER_PROMPT: {
      return {
        ...state,
        promptType: action.payload.promptType,
        promptProps: action.payload.promptProps
      };
    }

    case types.HIDE_BANNER_PROMPT: {
      return {
        ...state,
        promptType: null,
        promptProps: {}
      };
    }

    default:
      return state;
  }
}
