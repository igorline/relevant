import { normalize, schema } from 'normalizr';
import { api, alert } from 'app/utils';
import * as types from 'core/actionTypes';
import { setError } from 'modules/ui/error.actions';
import { removePost, updatePost } from 'modules/post/post.actions';
import { showPushNotificationPrompt } from 'modules/activity/activity.actions';

const Alert = alert.Alert();

const commentSchema = new schema.Entity('comments', {}, { idAttribute: '_id' });

export function addComment(parentId, newComment) {
  return {
    type: types.ADD_COMMENT,
    payload: {
      comment: newComment,
      parentId
    }
  };
}

export function setComments({ comments, childComments }) {
  return {
    type: types.SET_COMMENTS,
    payload: {
      comments,
      childComments
    }
  };
}

function filterComments(comments) {
  const childComments = {};
  comments.forEach(c => {
    if (!c.parentComment || c.parentComment === c.parentPost) {
      return (childComments[c.parentPost] = [
        ...(childComments[c.parentPost] || []),
        c._id
      ]);
    }
    return (childComments[c.parentComment] = [
      ...(childComments[c.parentComment] || []),
      c._id
    ]);
  });
  return childComments;
}

export function createComment(commentObj) {
  return async dispatch => {
    try {
      const comment = await dispatch(
        api.request({
          method: 'POST',
          endpoint: 'comment',
          path: '/',
          body: JSON.stringify(commentObj)
        })
      );
      const { parentComment, parentPost } = comment;
      const parentId = parentComment || parentPost;
      dispatch(addComment(parentId, comment));
      dispatch(
        showPushNotificationPrompt({
          type: 'createComment'
        })
      );
      return comment;
    } catch (err) {
      Alert.alert(err.message);
      return false;
    }
  };
}

export function getComments(post, skip, limit) {
  return async dispatch => {
    try {
      if (!skip) skip = 0;
      if (!limit) limit = 0;

      const responseJSON = await dispatch(
        api.request({
          method: 'GET',
          endpoint: 'comment',
          query: { post, skip, limit }
        })
      );

      dispatch(setError('comments', false));
      const childComments = filterComments(responseJSON.data);
      const { comments } = normalize(responseJSON.data, [commentSchema]).entities;
      dispatch(setComments({ comments, childComments }));
    } catch (err) {
      dispatch(setError('comments', true, err.message));
    }
  };
}

export function updateComment(comment) {
  return dispatch =>
    dispatch(
      api.request({
        method: 'PUT',
        endpoint: 'comment',
        body: JSON.stringify(comment)
      })
    )
      .then(res => dispatch(updatePost(res)))
      .catch(error => Alert.alert(error.message));
}

export function deleteComment(id) {
  return async dispatch => {
    try {
      await dispatch(
        api.request({
          method: 'DELETE',
          endpoint: 'comment',
          path: '/' + id
        })
      );
      return dispatch(removePost(id));
    } catch (err) {
      return Alert.alert(err.message);
    }
  };
}
