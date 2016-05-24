import auth from './auth';
import posts from './posts';
import user from './user';
import socket from './socket';
import notif from './notif';
import online from './online';
import messages from './messages';
var {Router, routerReducer, Route, Container, Animations, Schema} = require('react-native-redux-router');
// import { reducer as formReducer} from 'redux-form';

export {
  routerReducer,
  auth,
  posts,
  user,
  socket,
  notif,
  online,
  messages
};

