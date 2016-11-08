import * as types from './actionTypes';
require('../publicenv');
var {Router, routerReducer, Route, Container, Animations, Schema, Actions} = require('react-native-redux-router');
import * as utils from '../utils';
import {
  AlertIOS
} from 'react-native';


export function setError(bool, message) {
  if (message) AlertIOS.alert(message);
  return {
    type: 'SET_ERROR',
    payload: bool
  };
}

