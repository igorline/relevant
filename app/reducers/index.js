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
var {Router, routerReducer, Route, Container, Animations, Schema} = require('react-native-redux-router');

export {
  routerReducer,
  auth,
  posts,
  user,
  socket,
  notif,
  online,
  messages,
  animation,
  view,
  stats
};

