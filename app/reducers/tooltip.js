import * as types from '../actions/actionTypes';

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
  onboarding: ['relevance', 'coin', 'subscriptions', 'shareTip'],
  current: null
};

export default function tooltip(state = initialState, action) {
  switch (action.type) {

    case types.SET_ONBOARDING_STEP: {
      return {
        ...state,
        current: action.payload,
      };
    }

    case types.SET_TOOLTIP_DATA: {
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.name]: {
            ...state.data[action.payload.name],
            ...action.payload,
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
    default: return state;
  }
}
