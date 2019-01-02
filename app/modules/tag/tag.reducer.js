import * as types from 'core/actionTypes';

const initialState = {
  tags: [],
  selectedTags: [],
  parentTags: []
};

export default function tags(state = initialState, action) {
  switch (action.type) {
    case types.SET_DISCOVER_TAGS: {
      return Object.assign({}, state, {
        tags: action.payload
      });
    }

    case types.SELECT_TAG: {
      const index = state.selectedTags.findIndex(tag => action.payload._id === tag._id);
      if (index > -1) return state;
      return {
        ...state,
        selectedTags: [...state.selectedTags, action.payload]
      };
    }

    case types.DESELECT_TAG: {
      const index = state.selectedTags.findIndex(tag => action.payload._id === tag._id);
      return {
        ...state,
        selectedTags: [
          ...state.selectedTags.slice(0, index),
          ...state.selectedTags.slice(index + 1)
        ]
      };
    }

    case types.UPDATE_PARENT_TAG: {
      const index = state.parentTags.findIndex(tag => tag._id === action.payload._id);
      return {
        ...state,
        parentTags: [
          ...state.parentTags.slice(0, index),
          action.payload,
          ...state.parentTags.slice(index + 1)
        ]
      };
    }

    case types.SET_PARENT_TAGS: {
      return {
        ...state,
        parentTags: [...action.payload, ...state.parentTags]
      };
    }

    case types.LOGOUT_USER: {
      return { ...initialState };
    }

    default:
      return state;
  }
}
