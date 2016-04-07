import auth from './auth';
import posts from './posts';
import user from './user';
var {Router, routerReducer, Route, Container, Animations, Schema} = require('react-native-redux-router');
// import { reducer as formReducer} from 'redux-form';

export {
  routerReducer,
  auth,
  posts,
  user
};

