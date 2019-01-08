import * as types from 'core/actionTypes';
import { api } from 'app/utils';

export function addCommunity(community) {
  return {
    type: types.ADD_COMMUNITY,
    payload: community
  };
}

export function setCommunities(communities) {
  return {
    type: types.SET_COMMUNITIES,
    payload: communities
  };
}

export function setCommunityMembers(slug, members) {
  return {
    type: types.SET_COMMUNITY_MEMBERS,
    payload: { slug, members },
  };
}

// currently in auth, should move to community
// export function setCommunity(community) {
//   return dispatch => {
//     api.setCommunity(community);
//     return dispatch({
//       type: types.SET_COMMUNITY,
//       payload: community
//     });
//   };
// }

export function getCommunityAdmins() {}

export function getCommunityMembers(slug) {
  return async dispatch => {
    try {
      const members = await api.request({
        method: 'GET',
        endpoint: 'community',
        params: {
          slug,
          members: 'members',
        },
      });
      return dispatch(setCommunityMembers(slug, members));
    } catch (error) {
      return false;
    }
  };
}

export function getCommunities() {
  return async dispatch => {
    try {
      const res = await api.request({
        method: 'GET',
        endpoint: 'community'
      });
      // let ids = responseJSON.map(c => c._id);
      return dispatch(setCommunities(res));
    } catch (error) {
      return false;
    }
  };
}

export function createCommunity(community) {
  return async dispatch => {
    try {
      const responseJSON = await api.request({
        method: 'POST',
        endpoint: 'community',
        body: JSON.stringify(community)
      });
      return dispatch(addCommunity(responseJSON));
    } catch (error) {
      return false;
    }
  };
}
