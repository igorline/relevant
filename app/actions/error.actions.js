import * as types from './actionTypes';
import * as utils from '../utils';

const Alert = utils.api.Alert();

export function setError(type, bool, message) {
  if (message) Alert.alert(message);
  return {
    type: types.SET_ERROR,
    payload: {
      type,
      bool
    }
  };
}
