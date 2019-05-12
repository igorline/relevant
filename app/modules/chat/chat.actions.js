import * as types from 'core/actionTypes';

export function addPendingComment(comment, post) {
  return dispatch =>
    dispatch({
      type: types.ADD_PENDING_COMMENT,
      payload: { comment, post }
    });
}

export function removePendingComment(comment, post) {
  return dispatch =>
    dispatch({
      type: types.REMOVE_PENDING_COMMENT,
      payload: { comment, post }
    });
}
