import { Map } from 'immutable';

export const _initialState = { RelevantToken: { contracts: Map() } };

export const stateTransformer = state => ({
  ...state,
  RelevantToken: state.RelevantToken.toJS()
});

export const collapseActions = {
  LOGIN_USER_SUCCESS: true,
  socketId: true,
  SET_COMMUNITY: true,
  SET_COMMUNITIES: true,
  SET_WIDTH: true,
  SET_USER: true,
  SET_SELECTED_USER_DATA: true,
  SET_ERROR: true,
  TOOLTIP_READY: true,
  SET_USER_MEMBERSHIPS: true,
  SET_EARNINGS: true,
  SET_POSTS_SIMPLE: true,
  SET_COMMUNITY_MEMBERS: true
};
