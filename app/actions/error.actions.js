import * as types from './actionTypes';
import * as utils from '../utils';

let Alert = utils.fetchUtils.Alert();

export function setError(type, bool, message) {
  if (message) Alert.alert(message);
  return {
    type: 'SET_ERROR',
    payload: {
      type,
      bool
    }
  };
}

