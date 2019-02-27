import { combineReducers } from 'redux';
import notif from 'modules/activity/activity.reducer';
import animation from 'modules/animation/animation.reducer';
import auth from 'modules/auth/auth.reducer';
import admin from 'modules/admin/admin.reducer';
import community from 'modules/community/community.reducer';
import createPost from 'modules/createPost/createPost.reducer';
import posts from 'modules/post/post.reducer';
import user from 'modules/user/user.reducer';
import invest from 'modules/post/invest.reducer';
import comment from 'modules/comment/comment.reducer';
import tags from 'modules/tag/tag.reducer';
import stats from 'modules/stats/stats.reducer';
import tooltip from 'modules/tooltip/tooltip.reducer';
import error from 'modules/ui/error.reducer';
import earnings from 'modules/wallet/earnings.reducer';
import navigation from 'modules/navigation/navigation.reducer';
import { reducer as formReducer } from 'redux-form';

import socket from './socket.reducer';
import view from './view.reducer';
import subscriptions from './subscriptions.reducer';

let drizzleReducers = {};
if (process.env.WEB !== 'true') {
  // might need this form for conditional require
} else {
  // block these imports in package.json in react-native field
  const drizzle = require('drizzle');
  drizzleReducers = drizzle ? drizzle.drizzleReducers : {};
}

let communityState = {};

const appReducer = combineReducers({
  auth,
  posts,
  user,
  socket,
  form: formReducer,
  notif,
  error,
  animation,
  view,
  // TODO update
  investments: invest,
  stats,
  // TODO update
  comments: comment,
  navigation,
  createPost,
  tags,
  tooltip,
  subscriptions,
  admin,
  community,
  earnings,
  ...drizzleReducers
});

const initialState = {
  posts: appReducer.posts,
  user: appReducer.user,
  stats: appReducer.stats
};

// Purpose of this reducer is to swap out community state
// we swap out posts, user data and stats
const rootReducer = (state, action) => {
  if (action.type === 'SET_COMMUNITY') {
    const { community } = state.auth; // eslint-disable-line
    const { posts, user, stats } = state; // eslint-disable-line
    if (community) {
      communityState = {
        ...communityState,
        [community]: {
          posts,
          user,
          stats
        }
      };
    }

    const cachedCommunityState = communityState[action.payload] || initialState;

    const newState = {
      ...state,
      ...cachedCommunityState,
      auth: { ...state.auth, community: action.payload }
    };

    return appReducer(newState, action);
  }
  return appReducer(state, action);
};

export default rootReducer;
