import { normalize, schema } from 'normalizr';
import * as types from 'core/actionTypes';

const CommunitySchema = new schema.Entity('communities', {}, { idAttribute: 'slug' });
const MemberSchema = new schema.Entity('members', {}, { idAttribute: '_id' });

const initialState = {
  communities: {},
  list: [],
  active: null,
  members: {},
  communityMembers: {}
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
      const { members, slug } = action.payload;
      const data = normalize(members, [MemberSchema]);
      return {
        ...state,
        communityMembers: {
          ...state.communityMembers,
          [slug]: data.result
        },
        members: {
          ...state.members,
          ...data.entities.members
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
