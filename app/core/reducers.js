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

/* eslint-disable */
const rootReducer = (state, action) => {
  if (action.type === 'SET_COMMUNITY') {
    if (process.env.WEB !== 'true') {
      let { auth, community, socket, earnings, navigation, form } = state;

      if (auth.community) {
        communityState = {
          ...communityState,
          [auth.community]: state
        };
      }

      state = {
        ...communityState[action.payload],
        // TODO needs work?
        socket,
        auth: { ...auth, community: action.payload },
        navigation
      };
    } else {
      let {
        auth,
        community,
        socket,
        earnings,
        // DESKTOP
        // keep drizzle stuff - really need a nested state!
        contracts,
        drizzleStatus,
        transactions,
        transactionStack,
        web3,
        accounts,
        accountBalances,
        form
      } = state;

      if (auth.community) {
        communityState = {
          ...communityState,
          [auth.community]: state
        };
      }

      state = {
        ...communityState[action.payload],
        // TODO needs work?
        socket,
        auth: { ...auth, community: action.payload },

        community,
        contracts,
        drizzleStatus,
        transactions,
        transactionStack,
        web3,
        accounts,
        accountBalances
      };
    }
  }
  return appReducer(state, action);
};

export default rootReducer;
