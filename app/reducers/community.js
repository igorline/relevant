import { normalize, schema } from 'normalizr';
import * as types from '../actions/actionTypes';

const CommunitySchema = new schema.Entity('communities',
  {},
  { idAttribute: '_id' }
);

const initialState = {
  communities: {},
  list: []
};

// NOTE: comment objects are stored in posts state
export default function comments(state = initialState, action) {
  switch (action.type) {
    case types.SET_COMMUNITIES: {
      const normalized = normalize(action.payload, [CommunitySchema]);
      return {
        ...state,
        communities: {
          ...state.communities,
          ...normalized.entities.communities,
        },
        list: [...new Set([...state.list, ...normalized.result])]
      };
    }

    case types.ADD_COMMUNITY: {
      return {
        ...state,
        communities: {
          ...state.communities,
          [action.payload._id]: action.payload
        },
        list: [...new Set([...state.list, action.payload._id])]
      };
    }

    default:
      return state;
  }
}
