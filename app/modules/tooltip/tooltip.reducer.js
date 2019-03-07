import * as types from 'core/actionTypes';

const initialState = {
  vertical: null,
  horizontal: null,
  horizontalOffset: 0,
  verticalOffset: 0,
  text: '',
  parent: {},
  next: null,
  data: {},
  showing: {},
  onboarding: ['vote', 'relevance', 'coin', 'shareTip'],
  current: null,
  ready: false,
  buttonId: {}
};

export default function tooltip(state = initialState, action) {
  switch (action.type) {
    case types.SET_BUTTON_TOOLTIP: {
      return {
        ...state,
        buttonId: {
          ...state.buttonId,
          [action.payload.type]: action.payload.id
        }
      };
    }

    case types.TOOLTIP_READY: {
      return {
        ...state,
        ready: action.payload
      };
    }

    case types.SET_ONBOARDING_STEP: {
      return {
        ...state,
        current: action.payload
      };
    }

    case types.SET_TOOLTIP_DATA: {
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.name]: {
            ...state.data[action.payload.name],
            ...action.payload
          }
        }
      };
    }

    case types.SHOW_TOOLTIP: {
      if (action.payload) {
        return {
          ...state,
          showing: {
            ...state.data[action.payload]
          }
        };
      }
      return { ...initialState, data: state.data };
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
