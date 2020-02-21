import { normalize, schema } from 'normalizr';
import {
  UPDATE_POST_INVESTMENTS,
  UNDO_POST_INVESTMENT,
  SET_POST_INVESTMENTS,
  SET_INVESTMENTS,
  LOADING_INVESTMENTS,
  SET_USERS,
  LOADING_POST_INVESTMENTS
} from 'core/actionTypes';
import { api, alert } from 'app/utils';
import { setPostsSimple } from 'modules/post/post.actions';
import {
  showPushNotificationPrompt,
  showBetPrompt
} from 'modules/activity/activity.actions';

const Alert = alert.Alert();

const linkSchema = new schema.Entity('links', {}, { idAttribute: '_id' });

const postSchema = new schema.Entity(
  'posts',
  { metaPost: linkSchema },
  { idAttribute: '_id' }
);

const userSchema = new schema.Entity('users', {}, { idAttribute: '_id' });

const investmentSchema = new schema.Entity(
  'investments',
  {
    post: postSchema,
    investor: userSchema
  },
  { idAttribute: '_id' }
);

export function updatePostVote(voteObj) {
  return {
    type: UPDATE_POST_INVESTMENTS,
    payload: voteObj
  };
}

export function undoPostVote(post) {
  return {
    type: UNDO_POST_INVESTMENT,
    payload: post
  };
}

export function setInvestments(investments, userId, index) {
  return {
    type: SET_INVESTMENTS,
    payload: {
      investments,
      userId,
      index
    }
  };
}

export function loadingInvestments() {
  return {
    type: LOADING_INVESTMENTS
  };
}

export function setPostInvestments(data, postId, skip) {
  return {
    type: SET_POST_INVESTMENTS,
    payload: {
      postId,
      data,
      index: skip || 0
    }
  };
}

export function setUsers(users) {
  return {
    type: SET_USERS,
    payload: users
  };
}

// optimistic ui
export function vote({ amount, post, user, vote: undo, displayBetPrompt }) {
  return async dispatch => {
    try {
      if (undo) dispatch(undoPostVote(post._id));
      else dispatch(updatePostVote({ post: post._id, amount }));
      const res = await dispatch(
        api.request({
          method: 'POST',
          endpoint: 'invest',
          path: '/',
          body: JSON.stringify({
            investor: user._id,
            amount,
            post
          })
        })
      );
      if (res.undoInvest) dispatch(undoPostVote(post._id));
      else dispatch(updatePostVote(res.investment));
      const isComment = !!post.parentPost;
      if (amount > 0 && !undo) {
        const showingPushBanner = await dispatch(
          showPushNotificationPrompt({
            type: isComment ? 'upvoteComment' : 'upvotePost'
          })
        );
        if (!showingPushBanner && displayBetPrompt) dispatch(showBetPrompt);
      }
      return res;
    } catch (error) {
      if (undo) dispatch(updatePostVote({ post: post._id, amount }));
      else dispatch(undoPostVote(post._id));
      return Alert.alert(error.message);
    }
  };
}

export function getInvestments(userId, skip, limit) {
  return async dispatch => {
    try {
      dispatch(loadingInvestments());
      const res = await dispatch(
        api.request({
          method: 'GET',
          endpoint: 'invest',
          path: '/' + userId,
          query: { skip, limit }
        })
      );
      const data = normalize({ investments: res }, { investments: [investmentSchema] });
      dispatch(setPostsSimple(data));
      dispatch(setInvestments(data, userId, skip));
    } catch (err) {
      // console.log(err);
    }
  };
}

export function loadingPostInvestments(postId) {
  return {
    type: LOADING_POST_INVESTMENTS,
    payload: postId
  };
}

export function getPostInvestments(postId, limit, skip) {
  return async dispatch => {
    try {
      dispatch(loadingPostInvestments(postId));
      const res = await dispatch(
        api.request({
          method: 'GET',
          endpoint: 'invest',
          query: { skip, limit },
          path: `/post/${postId}`
        })
      );
      const data = normalize({ investments: res }, { investments: [investmentSchema] });
      dispatch(setUsers(data.entities.users));
      dispatch(setPostInvestments(data, postId, skip));
    } catch (err) {
      // console.warn(err);
    }
  };
}

export function bet({ postId, stakedTokens }) {
  return async dispatch => {
    try {
      const res = await dispatch(
        api.request({
          method: 'POST',
          endpoint: 'invest',
          path: '/bet',
          body: JSON.stringify({
            postId,
            stakedTokens
          })
        })
      );
      return dispatch(updatePostVote(res));
    } catch (err) {
      Alert.alert(err.message);
      throw err;
    }
  };
}
