import { combineReducers } from 'redux';
import auth from './auth';
import posts from './posts';
import user from './user';
import socket from './socket';
import notif from './notif';
import messages from './messages';
import animation from './animation';
import error from './error';
import view from './view';
import stats from './stats';
import investments from './investments';
import comments from './comments';
import createPost from './createPost';
import tags from './tags';
import tooltip from './tooltip';
import subscriptions from './subscriptions';
import admin from './admin';
import community from './community';

let navigation = {};
let routing = {};
let drizzleReducers = {};
if (process.env.WEB != 'true') {
  navigation = require('./navigation').default;
} else {
  // block these imports in package.json in react-native field
  routing = require('react-router-redux').routerReducer;
  let drizzle = require('drizzle');
  drizzleReducers = drizzle ? drizzle.drizzleReducers : {};
}

let communityState = {};

const appReducer = combineReducers({
  auth,
  posts,
  user,
  socket,
  notif,
  error,
  messages,
  animation,
  view,
  investments,
  stats,
  comments,
  navigation,
  routing,
  createPost,
  tags,
  tooltip,
  subscriptions,
  admin,
  community,
  ...drizzleReducers,
});

const rootReducer = (state, action) => {
  if (action.type === 'SET_COMMUNITY') {

    if (process.env.WEB != 'true') {

      const {
        auth,
        community,
        socket,

        //MOBILE
        navigation,

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
        auth: {...auth, community: action.payload },
        navigation
      };


    } else {
      const {
        auth,
        community,
        socket,

        //DESKTOP
        // keep drizzle stuff - really need a nested state!
        routing,
        contracts,
        drizzleStatus,
        transactions,
        transactionStack,
        web3,
        accounts,
        accountBalances,
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
        auth: {...auth, community: action.payload },

        routing,
        community,
        contracts,
        drizzleStatus,
        transactions,
        transactionStack,
        web3,
        accounts,
        accountBalances,
      };
    }

  }
  return appReducer(state, action);
};

export default rootReducer;

