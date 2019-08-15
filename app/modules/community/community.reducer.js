import { normalize, schema } from 'normalizr';
import * as types from 'core/actionTypes';
import { unique } from 'utils/list';

const CommunitySchema = new schema.Entity('communities', {}, { idAttribute: 'slug' });
const MemberSchema = new schema.Entity('members', {}, { idAttribute: '_id' });

const initialState = {
  communities: {},
  list: [],
  active: null,
  members: {},
  communityMembers: {},
  userMemberships: [],
  userCommunities: [],
  slugToId: {}
};

export default function community(state = initialState, action) {
  switch (action.type) {
    case types.SET_COMMUNITIES: {
      const normalized = normalize(action.payload, [CommunitySchema]);
      const slugToId = {};
      normalized.result.forEach(cId => {
        const c = normalized.entities.communities[cId];
        slugToId[c.slug] = c._id;
      });
      return {
        ...state,
        communities: {
          ...state.communities,
          ...normalized.entities.communities
        },
        list: [...new Set([...state.list, ...normalized.result])],
        slugToId: {
          ...state.slugToId,
          ...slugToId
        }
      };
    }

    case types.SET_USER_MEMBERSHIPS: {
      return {
        ...state,
        userMemberships: action.payload,
        userCommunities: action.payload.map(m => m.communityId)
      };
    }

    case types.ADD_USER_MEMBERSHIP: {
      return {
        ...state,
        userMemberships: [...state.userMemberships, action.payload],
        userCommunities: [...state.userCommunities, action.payload.communityId]
      };
    }

    case types.SET_COMMUNITY: {
      return {
        ...state,
        active: action.payload
      };
    }

    case types.REMOVE_COMMUNITY: {
      const updatedCommunities = { ...state.communities };
      delete updatedCommunities[action.payload];
      delete updatedCommunities[action.payload];
      return {
        ...state,
        communities: {
          ...updatedCommunities
        }
      };
    }

    case types.SET_COMMUNITY_MEMBERS: {
      const { members, slug } = action.payload;
      const data = normalize(members, [MemberSchema]);
      const existingCommunityMembers = state.communityMembers[slug] || [];
      return {
        ...state,
        communityMembers: {
          ...state.communityMembers,
          [slug]: unique([...existingCommunityMembers, ...data.result])
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
          [action.payload.slug]: action.payload
        },
        list: [...new Set([...state.list, action.payload.slug])]
      };
    }

    case types.UPDATE_COMMUNITY: {
      return {
        ...state,
        communities: {
          ...state.communities,
          [action.payload.slug]: action.payload
        }
      };
    }

    default:
      return state;
  }
}
