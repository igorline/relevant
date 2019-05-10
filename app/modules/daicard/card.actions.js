import * as types from 'core/actionTypes';

export function updateConnextState(params) {
  return {
    type: types.UPDATE_CONNEXT_STATE,
    payload: params
  };
}
