import * as types from 'core/actionTypes';
import * as utils from 'app/utils';

const Alert = utils.alert.Alert();

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
