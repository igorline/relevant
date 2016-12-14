import * as types from './actionTypes';

export function setView(type, view) {
  return {
    type: types.SET_VIEW,
    payload: {
      view,
      type
    }
  };
}
