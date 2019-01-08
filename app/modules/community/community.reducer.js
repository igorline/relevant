import { normalize, schema } from 'normalizr';
import * as types from 'core/actionTypes';

const CommunitySchema = new schema.Entity('communities', {}, { idAttribute: 'slug' });

const initialState = {
  communities: {},
  list: [],
  active: null,
};

export default function community(state = initialState, action) {
  switch (action.type) {
    case types.SET_COMMUNITIES: {
      const normalized = normalize(action.payload, [CommunitySchema]);
      return {
        ...state,
        communities: {
          ...state.communities,
          ...normalized.entities.communities
        },
        list: [...new Set([...state.list, ...normalized.result])]
      };
    }

    case types.SET_COMMUNITY: {
      return {
        ...state,
        active: action.payload
      };
    }

    case types.SET_COMMUNITY_MEMBERS: {
      return {
        ...state,
        communities: {
          ...state.communities,
          [action.payload.slug]: {
            ...state.communities[action.payload.slug],
            members: action.payload.members,
          }
        }
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
