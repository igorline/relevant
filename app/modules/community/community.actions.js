import * as types from 'core/actionTypes';
import * as utils from 'app/utils';

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

export function getCommunityAdmins() {}

export function getCommunityMembers() {}

export function getCommunities() {
  return async dispatch => {
    try {
      const res = await utils.api.request({
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
      const responseJSON = await utils.api.request({
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
