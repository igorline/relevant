import * as types from '../actions/actionTypes';

const initialState = {
  tags: [],
  selectedTags: [],
  parentTags: [],
};

export default function tags(state = initialState, action) {
  switch (action.type) {

    case types.SET_DISCOVER_TAGS: {
      return Object.assign({}, state, {
        tags: action.payload,
      });
    }

    case types.SELECT_TAG: {
      let index = state.selectedTags.findIndex(tag => action.payload._id === tag._id);
      if (index > -1) return state;
      return {
        ...state,
        selectedTags: [...state.selectedTags, action.payload]
      };
    }

    case types.DESELECT_TAG: {
      let index = state.selectedTags.findIndex(tag => action.payload._id === tag._id);
      return {
        ...state,
        selectedTags: [
          ...state.selectedTags.slice(0, index),
          ...state.selectedTags.slice(index + 1)
        ]
      };
    }

    case types.SET_PARENT_TAGS: {
      return Object.assign({}, state, {
        parentTags: action.payload,
      });
    }


    default: return state;
  }
}
