import * as types from './actionTypes';
require('../publicenv');
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

