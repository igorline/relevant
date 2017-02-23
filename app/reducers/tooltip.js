import * as types from '../actions/actionTypes';

const initialState = {
  vertical: null,
  horizontal: null,
  horizontalOffset: 0,
  verticalOffset: 0,
  text: '',
  parent: {}
};

export default function tooltip(state = initialState, action) {
  switch (action.type) {
    case types.SHOW_TOOLTIP: {
      if (action.payload) {
        return {
          ...state,
          ...action.payload
        };
      }
      return { ...initialState };
    }
    default: return state;
  }
}
