import * as types from 'core/actionTypes';

export function addPendingComment(comment, post) {
  // kludge so we can display this comment immediately :-/
  comment.body = comment.text;
  comment.createdAt = new Date();
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
