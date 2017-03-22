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

let navigation = {};
let routing = {};
if (process.env.WEB != 'true') {
  navigation = require('./navigation').default;
} else {
  routing = require('react-router-redux').routerReducer;
}

const rootReducer = combineReducers({
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
  subscriptions
});

export default rootReducer;

