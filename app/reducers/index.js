import { combineReducers } from 'redux';
import auth from './auth';
import posts from './posts';
import user from './user';
import socket from './socket';
import notif from './notif';
import online from './online';
import messages from './messages';
import animation from './animation';
import view from './view';
import stats from './stats';
import investments from './investments';
import comments from './comments';
import tabs from './tabs';
import navigation from './navigation';
import tags from './tags';

const rootReducer = combineReducers({
  auth,
  posts,
  user,
  socket,
  notif,
  online,
  messages,
  animation,
  view,
  investments,
  stats,
  comments,
  tabs,
  navigation
});

export default rootReducer;

